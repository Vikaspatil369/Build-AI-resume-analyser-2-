package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.ResumeAnalysisResponse;

import java.util.List;

public interface AnalysisService {
    ResumeAnalysisResponse queueAnalysis(String versionId, String jobId);
    ResumeAnalysisResponse queueStandaloneAnalysis(String versionId);
    ResumeAnalysisResponse getAnalysis(String analysisId);
    List<ResumeAnalysisResponse> getAnalysisHistory();
    List<ResumeAnalysisResponse> getResumeAnalyses(String resumeId);
    byte[] exportReport(String analysisId);
    ResumeAnalysisResponse mapToResponse(com.airesumeanalyzer.backend.entity.ResumeAnalysis analysis);
}
