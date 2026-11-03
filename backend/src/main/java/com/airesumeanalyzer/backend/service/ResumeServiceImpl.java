package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.ResumeResponse;
import com.airesumeanalyzer.backend.dto.ResumeVersionResponse;
import com.airesumeanalyzer.backend.dto.parser.ParsedResume;
import com.airesumeanalyzer.backend.entity.Resume;
import com.airesumeanalyzer.backend.entity.ResumeVersion;
import com.airesumeanalyzer.backend.entity.User;
import com.airesumeanalyzer.backend.exception.ApiException;
import com.airesumeanalyzer.backend.repository.ResumeRepository;
import com.airesumeanalyzer.backend.repository.ResumeVersionRepository;
import com.airesumeanalyzer.backend.repository.UserRepository;
import com.airesumeanalyzer.backend.security.UserDetailsImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final UserRepository userRepository;
    private final DocumentParserService documentParserService;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User is not authenticated");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User not found"));
    }

    @Override
    @Transactional
    public ResumeResponse uploadResume(MultipartFile file) {
        log.info("Uploading resume: {}", file.getOriginalFilename());
        
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_FILE", "Uploaded file is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            filename = "resume.pdf";
        }

        // Sanitize filename to avoid directory traversal
        filename = filename.replaceAll("[^a-zA-Z0-9._-]", "_");

        // Validate size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE", "File size exceeds limit of 5MB");
        }

        try {
            byte[] fileBytes = file.getBytes();
            String rawText = documentParserService.extractText(fileBytes, filename);
            ParsedResume parsedResume = aiService.parseResume(rawText);

            User user = getCurrentUser();

            String fileType = filename.contains(".") 
                    ? filename.substring(filename.lastIndexOf('.') + 1).toUpperCase() 
                    : "PDF";

            Resume resume = Resume.builder()
                    .user(user)
                    .filename(filename)
                    .fileType(fileType)
                    .build();

            Resume savedResume = resumeRepository.save(resume);

            ResumeVersion version = ResumeVersion.builder()
                    .resume(savedResume)
                    .name("v1_Initial")
                    .versionNumber(1)
                    .rawTextContent(rawText)
                    .parsedJsonContent(objectMapper.writeValueAsString(parsedResume))
                    .build();

            ResumeVersion savedVersion = resumeVersionRepository.save(version);

            List<ResumeVersionResponse> versions = List.of(mapToVersionResponse(savedVersion));

            return ResumeResponse.builder()
                    .id(savedResume.getId())
                    .filename(savedResume.getFilename())
                    .fileType(savedResume.getFileType())
                    .latestVersionNumber(1)
                    .latestVersionId(savedVersion.getId())
                    .versions(versions)
                    .createdAt(savedResume.getCreatedAt())
                    .updatedAt(savedResume.getUpdatedAt())
                    .build();

        } catch (ApiException e) {
            throw e;
        } catch (IOException e) {
            log.error("Failed to read uploaded file: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_READ_ERROR", "Could not process uploaded file: " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to upload and process resume: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "RESUME_PROCESSING_ERROR", "Failed to process resume: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResponse> listAllResumes() {
        User user = getCurrentUser();
        log.info("Listing resumes for user: {}", user.getEmail());
        
        List<Resume> resumes = resumeRepository.findByUserId(user.getId());
        
        return resumes.stream().map(resume -> {
            ResumeVersion latest = resumeVersionRepository.findFirstByResumeIdOrderByVersionNumberDesc(resume.getId())
                    .orElse(null);
            
            return ResumeResponse.builder()
                    .id(resume.getId())
                    .filename(resume.getFilename())
                    .fileType(resume.getFileType())
                    .latestVersionNumber(latest != null ? latest.getVersionNumber() : 0)
                    .latestVersionId(latest != null ? latest.getId() : null)
                    .createdAt(resume.getCreatedAt())
                    .updatedAt(resume.getUpdatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResponse getResume(String id) {
        User user = getCurrentUser();
        log.info("Retrieving resume {} for user {}", id, user.getEmail());

        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RESUME_NOT_FOUND", "Resume not found"));

        List<ResumeVersion> versions = resumeVersionRepository.findByResumeIdOrderByVersionNumberDesc(id);
        ResumeVersion latest = versions.isEmpty() ? null : versions.get(0);

        List<ResumeVersionResponse> versionResponses = versions.stream()
                .map(this::mapToVersionResponse)
                .collect(Collectors.toList());

        return ResumeResponse.builder()
                .id(resume.getId())
                .filename(resume.getFilename())
                .fileType(resume.getFileType())
                .latestVersionNumber(latest != null ? latest.getVersionNumber() : 0)
                .latestVersionId(latest != null ? latest.getId() : null)
                .versions(versionResponses)
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteResume(String id) {
        User user = getCurrentUser();
        log.info("Deleting resume {} for user {}", id, user.getEmail());

        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RESUME_NOT_FOUND", "Resume not found"));

        resumeRepository.delete(resume);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeVersionResponse getVersion(String versionId) {
        User user = getCurrentUser();
        log.info("Retrieving resume version {} for user {}", versionId, user.getEmail());

        ResumeVersion version = resumeVersionRepository.findByIdAndResumeUserId(versionId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "VERSION_NOT_FOUND", "Resume version not found"));

        return mapToVersionResponse(version);
    }

    @Override
    @Transactional
    public ResumeResponse renameResume(String id, String newName) {
        User user = getCurrentUser();
        log.info("Renaming resume {} to {} for user {}", id, newName, user.getEmail());

        Resume resume = resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RESUME_NOT_FOUND", "Resume not found"));

        resume.setFilename(newName);
        Resume saved = resumeRepository.save(resume);

        return getResume(saved.getId());
    }

    @Override
    @Transactional
    public ResumeVersionResponse duplicateVersion(String versionId, String newName) {
        User user = getCurrentUser();
        log.info("Duplicating version {} with name {} for user {}", versionId, newName, user.getEmail());

        ResumeVersion existing = resumeVersionRepository.findByIdAndResumeUserId(versionId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "VERSION_NOT_FOUND", "Version not found"));

        // Get max version number
        ResumeVersion latest = resumeVersionRepository.findFirstByResumeIdOrderByVersionNumberDesc(existing.getResume().getId())
                .orElse(existing);

        ResumeVersion copy = ResumeVersion.builder()
                .resume(existing.getResume())
                .name(newName)
                .versionNumber(latest.getVersionNumber() + 1)
                .rawTextContent(existing.getRawTextContent())
                .parsedJsonContent(existing.getParsedJsonContent())
                .build();

        ResumeVersion saved = resumeVersionRepository.save(copy);
        return mapToVersionResponse(saved);
    }

    private ResumeVersionResponse mapToVersionResponse(ResumeVersion version) {
        ParsedResume parsedContent = null;
        try {
            if (version.getParsedJsonContent() != null) {
                parsedContent = objectMapper.readValue(version.getParsedJsonContent(), ParsedResume.class);
            }
        } catch (Exception e) {
            log.error("Failed to parse resume JSON content for version {}: {}", version.getId(), e.getMessage());
        }

        return ResumeVersionResponse.builder()
                .id(version.getId())
                .resumeId(version.getResume().getId())
                .name(version.getName())
                .versionNumber(version.getVersionNumber())
                .parsedContent(parsedContent)
                .createdAt(version.getCreatedAt())
                .updatedAt(version.getUpdatedAt())
                .build();
    }
}
