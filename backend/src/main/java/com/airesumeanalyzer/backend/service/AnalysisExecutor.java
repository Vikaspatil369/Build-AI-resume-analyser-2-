package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.parser.ParsedJobDescription;
import com.airesumeanalyzer.backend.dto.parser.ParsedResume;
import com.airesumeanalyzer.backend.entity.AnalysisStatus;
import com.airesumeanalyzer.backend.entity.JobDescription;
import com.airesumeanalyzer.backend.entity.ResumeAnalysis;
import com.airesumeanalyzer.backend.entity.ResumeVersion;
import com.airesumeanalyzer.backend.repository.JobDescriptionRepository;
import com.airesumeanalyzer.backend.repository.ResumeAnalysisRepository;
import com.airesumeanalyzer.backend.repository.ResumeVersionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AnalysisExecutor {

    private final ResumeVersionRepository resumeVersionRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional
    public void executeAnalysis(String analysisId, String versionId, String jobId) {
        log.info("Starting async analysis {} for version {}", analysisId, versionId);

        ResumeAnalysis analysis = resumeAnalysisRepository.findById(analysisId).orElse(null);
        if (analysis == null) {
            try {
                Thread.sleep(300);
            } catch (InterruptedException ignored) {}
            analysis = resumeAnalysisRepository.findById(analysisId).orElse(null);
        }
        if (analysis == null) {
            log.error("Analysis record {} not found in database", analysisId);
            return;
        }

        // Update status to PROCESSING
        analysis.setStatus(AnalysisStatus.PROCESSING);
        resumeAnalysisRepository.saveAndFlush(analysis);

        try {
            ResumeVersion version = resumeVersionRepository.findById(versionId)
                    .orElseThrow(() -> new IllegalArgumentException("Resume version not found: " + versionId));

            ParsedResume parsedResume = objectMapper.readValue(version.getParsedJsonContent(), ParsedResume.class);
            String rawResumeText = version.getRawTextContent();

            ResumeAnalysis result;

            if (jobId != null) {
                JobDescription jd = jobDescriptionRepository.findById(jobId)
                        .orElseThrow(() -> new IllegalArgumentException("Job description not found: " + jobId));

                ParsedJobDescription parsedJob = objectMapper.readValue(jd.getParsedJsonKeywords(), ParsedJobDescription.class);
                String rawJobText = jd.getRawText();

                result = aiService.analyzeResumeAgainstJob(parsedResume, rawResumeText, parsedJob, rawJobText);
            } else {
                result = aiService.analyzeResumeStandalone(parsedResume, rawResumeText);
            }

            // Copy results back to the database entity
            analysis.setAtsScore(result.getAtsScore());
            analysis.setJobMatchScore(result.getJobMatchScore());
            analysis.setSectionScoresJson(result.getSectionScoresJson());
            analysis.setKeywordAnalysisJson(result.getKeywordAnalysisJson());
            analysis.setSkillGapJson(result.getSkillGapJson());
            analysis.setFormattingIssuesJson(result.getFormattingIssuesJson());
            analysis.setGrammarAnalysisJson(result.getGrammarAnalysisJson());
            analysis.setImprovementsJson(result.getImprovementsJson());
            analysis.setRoleRecommendationsJson(result.getRoleRecommendationsJson());
            analysis.setStatus(AnalysisStatus.COMPLETED);

            log.info("Async analysis {} completed successfully", analysisId);

        } catch (Exception e) {
            log.error("Async analysis {} failed: {}", analysisId, e.getMessage(), e);
            analysis.setStatus(AnalysisStatus.FAILED);
            analysis.setErrorMessage("Error performing AI analysis: " + e.getMessage());
        }

        resumeAnalysisRepository.save(analysis);
    }
}
