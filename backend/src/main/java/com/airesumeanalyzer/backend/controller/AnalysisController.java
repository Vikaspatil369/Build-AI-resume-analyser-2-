package com.airesumeanalyzer.backend.controller;

import com.airesumeanalyzer.backend.dto.ApiResponse;
import com.airesumeanalyzer.backend.dto.ResumeAnalysisResponse;
import com.airesumeanalyzer.backend.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/resume/{versionId}")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> analyzeResume(
            @PathVariable("versionId") String versionId) {
        ResumeAnalysisResponse response = analysisService.queueStandaloneAnalysis(versionId);
        return ResponseEntity.ok(ApiResponse.success(response, "Standalone analysis queued successfully"));
    }

    @PostMapping("/resume/{versionId}/job/{jobId}")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> analyzeResumeAgainstJob(
            @PathVariable("versionId") String versionId,
            @PathVariable("jobId") String jobId) {
        ResumeAnalysisResponse response = analysisService.queueAnalysis(versionId, jobId);
        return ResponseEntity.ok(ApiResponse.success(response, "Job-matched analysis queued successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> getAnalysis(@PathVariable("id") String id) {
        ResumeAnalysisResponse response = analysisService.getAnalysis(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Analysis record retrieved successfully"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<ResumeAnalysisResponse>>> getAnalysisHistory() {
        List<ResumeAnalysisResponse> response = analysisService.getAnalysisHistory();
        return ResponseEntity.ok(ApiResponse.success(response, "Analysis history retrieved successfully"));
    }

    @GetMapping("/resume-history/{resumeId}")
    public ResponseEntity<ApiResponse<List<ResumeAnalysisResponse>>> getResumeAnalyses(
            @PathVariable("resumeId") String resumeId) {
        List<ResumeAnalysisResponse> response = analysisService.getResumeAnalyses(resumeId);
        return ResponseEntity.ok(ApiResponse.success(response, "Resume analyses retrieved successfully"));
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportAnalysisReport(@PathVariable("id") String id) {
        byte[] pdfBytes = analysisService.exportReport(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"resume-analysis-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
