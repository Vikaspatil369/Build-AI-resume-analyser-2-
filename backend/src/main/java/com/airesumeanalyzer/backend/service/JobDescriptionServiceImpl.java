package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.JobDescriptionRequest;
import com.airesumeanalyzer.backend.dto.JobDescriptionResponse;
import com.airesumeanalyzer.backend.dto.parser.ParsedJobDescription;
import com.airesumeanalyzer.backend.entity.JobDescription;
import com.airesumeanalyzer.backend.entity.User;
import com.airesumeanalyzer.backend.exception.ApiException;
import com.airesumeanalyzer.backend.repository.JobDescriptionRepository;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobDescriptionServiceImpl implements JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;
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
    public JobDescriptionResponse createJobDescription(JobDescriptionRequest request) {
        log.info("Creating and parsing job description: {}", request.getTitle());
        User user = getCurrentUser();

        try {
            ParsedJobDescription parsedKeywords = aiService.parseJobDescription(request.getRawText());

            JobDescription jd = JobDescription.builder()
                    .user(user)
                    .title(request.getTitle())
                    .company(request.getCompany())
                    .rawText(request.getRawText())
                    .parsedJsonKeywords(objectMapper.writeValueAsString(parsedKeywords))
                    .build();

            JobDescription saved = jobDescriptionRepository.save(jd);
            return mapToResponse(saved);

        } catch (Exception e) {
            log.error("Failed to parse and save job description: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "JOB_PARSE_ERROR", "Failed to parse job description.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDescriptionResponse> listAllJobDescriptions() {
        User user = getCurrentUser();
        log.info("Listing job descriptions for user: {}", user.getEmail());

        List<JobDescription> jds = jobDescriptionRepository.findByUserId(user.getId());
        return jds.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public JobDescriptionResponse getJobDescription(String id) {
        User user = getCurrentUser();
        log.info("Retrieving job description {} for user {}", id, user.getEmail());

        JobDescription jd = jobDescriptionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "JOB_NOT_FOUND", "Job description not found"));

        return mapToResponse(jd);
    }

    @Override
    @Transactional
    public void deleteJobDescription(String id) {
        User user = getCurrentUser();
        log.info("Deleting job description {} for user {}", id, user.getEmail());

        JobDescription jd = jobDescriptionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "JOB_NOT_FOUND", "Job description not found"));

        jobDescriptionRepository.delete(jd);
    }

    private JobDescriptionResponse mapToResponse(JobDescription jd) {
        ParsedJobDescription parsedKeywords = null;
        try {
            if (jd.getParsedJsonKeywords() != null) {
                parsedKeywords = objectMapper.readValue(jd.getParsedJsonKeywords(), ParsedJobDescription.class);
            }
        } catch (Exception e) {
            log.error("Failed to parse job description JSON: {}", e.getMessage());
        }

        return JobDescriptionResponse.builder()
                .id(jd.getId())
                .title(jd.getTitle())
                .company(jd.getCompany())
                .rawText(jd.getRawText())
                .parsedKeywords(parsedKeywords)
                .createdAt(jd.getCreatedAt())
                .build();
    }
}
