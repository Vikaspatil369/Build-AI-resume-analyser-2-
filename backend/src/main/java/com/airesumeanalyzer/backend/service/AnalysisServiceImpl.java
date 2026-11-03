package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.ResumeAnalysisResponse;
import com.airesumeanalyzer.backend.entity.*;
import com.airesumeanalyzer.backend.exception.ApiException;
import com.airesumeanalyzer.backend.repository.*;
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
public class AnalysisServiceImpl implements AnalysisService {

    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final UserRepository userRepository;
    private final AnalysisExecutor analysisExecutor;
    private final ObjectMapper objectMapper;
    private final ReportGeneratorService reportGeneratorService;

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
    public ResumeAnalysisResponse queueAnalysis(String versionId, String jobId) {
        log.info("Queueing analysis for version {} and job {}", versionId, jobId);
        User user = getCurrentUser();

        ResumeVersion version = resumeVersionRepository.findByIdAndResumeUserId(versionId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "VERSION_NOT_FOUND", "Resume version not found"));

        JobDescription jd = null;
        if (jobId != null) {
            jd = jobDescriptionRepository.findByIdAndUserId(jobId, user.getId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "JOB_NOT_FOUND", "Job description not found"));
        }

        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .resumeVersion(version)
                .jobDescription(jd)
                .status(AnalysisStatus.PENDING)
                .build();

        ResumeAnalysis savedAnalysis = resumeAnalysisRepository.save(analysis);

        // Run asynchronously in the background after transaction commits
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        analysisExecutor.executeAnalysis(savedAnalysis.getId(), versionId, jobId);
                    }
                }
            );
        } else {
            analysisExecutor.executeAnalysis(savedAnalysis.getId(), versionId, jobId);
        }

        return mapToResponse(savedAnalysis);
    }

    @Override
    @Transactional
    public ResumeAnalysisResponse queueStandaloneAnalysis(String versionId) {
        return queueAnalysis(versionId, null);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeAnalysisResponse getAnalysis(String analysisId) {
        User user = getCurrentUser();
        log.info("Retrieving analysis {} for user {}", analysisId, user.getEmail());

        ResumeAnalysis analysis = resumeAnalysisRepository.findByIdAndResumeVersionResumeUserId(analysisId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ANALYSIS_NOT_FOUND", "Analysis record not found"));

        return mapToResponse(analysis);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeAnalysisResponse> getAnalysisHistory() {
        User user = getCurrentUser();
        log.info("Retrieving analysis history for user {}", user.getEmail());

        List<ResumeAnalysis> analyses = resumeAnalysisRepository.findRecentAnalysesByUserId(user.getId());
        return analyses.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeAnalysisResponse> getResumeAnalyses(String resumeId) {
        User user = getCurrentUser();
        log.info("Retrieving analyses for resume {} of user {}", resumeId, user.getEmail());

        // Verify resume belongs to user
        List<ResumeAnalysis> analyses = resumeAnalysisRepository.findByResumeVersionResumeId(resumeId);
        
        // Filter by user ownership (since raw repo query doesn't check owner)
        return analyses.stream()
                .filter(a -> a.getResumeVersion().getResume().getUser().getId().equals(user.getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportReport(String analysisId) {
        User user = getCurrentUser();
        log.info("Generating PDF report for analysis {} and user {}", analysisId, user.getEmail());

        ResumeAnalysis analysis = resumeAnalysisRepository.findByIdAndResumeVersionResumeUserId(analysisId, user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ANALYSIS_NOT_FOUND", "Analysis record not found"));

        try {
            return reportGeneratorService.generatePdfReport(analysis);
        } catch (Exception e) {
            log.error("Failed to generate PDF report: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "REPORT_GENERATION_FAILED", "Failed to generate PDF report: " + e.getMessage());
        }
    }

    @Override
    public ResumeAnalysisResponse mapToResponse(ResumeAnalysis analysis) {
        return ResumeAnalysisResponse.builder()
                .id(analysis.getId())
                .resumeId(analysis.getResumeVersion().getResume().getId())
                .resumeName(analysis.getResumeVersion().getResume().getFilename())
                .versionId(analysis.getResumeVersion().getId())
                .versionNumber(analysis.getResumeVersion().getVersionNumber())
                .jobId(analysis.getJobDescription() != null ? analysis.getJobDescription().getId() : null)
                .jobTitle(analysis.getJobDescription() != null ? analysis.getJobDescription().getTitle() : null)
                .jobCompany(analysis.getJobDescription() != null ? analysis.getJobDescription().getCompany() : null)
                .status(analysis.getStatus().name())
                .atsScore(analysis.getAtsScore())
                .jobMatchScore(analysis.getJobMatchScore())
                .sectionScores(analysis.getSectionScoresJson())
                .keywordAnalysis(analysis.getKeywordAnalysisJson())
                .skillGap(analysis.getSkillGapJson())
                .formattingIssues(analysis.getFormattingIssuesJson())
                .grammarAnalysis(analysis.getGrammarAnalysisJson())
                .improvements(analysis.getImprovementsJson())
                .roleRecommendations(analysis.getRoleRecommendationsJson())
                .errorMessage(analysis.getErrorMessage())
                .createdAt(analysis.getCreatedAt())
                .build();
    }
}
