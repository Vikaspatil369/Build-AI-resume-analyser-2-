package com.airesumeanalyzer.backend.controller;

import com.airesumeanalyzer.backend.dto.ApiResponse;
import com.airesumeanalyzer.backend.dto.ResumeResponse;
import com.airesumeanalyzer.backend.dto.ResumeVersionResponse;
import com.airesumeanalyzer.backend.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = {"", "/upload"})
    public ResponseEntity<ApiResponse<ResumeResponse>> uploadResume(@RequestParam("file") MultipartFile file) {
        ResumeResponse response = resumeService.uploadResume(file);
        return ResponseEntity.ok(ApiResponse.success(response, "Resume uploaded and parsed successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> listAllResumes() {
        List<ResumeResponse> response = resumeService.listAllResumes();
        return ResponseEntity.ok(ApiResponse.success(response, "Resumes retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResume(@PathVariable("id") String id) {
        ResumeResponse response = resumeService.getResume(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Resume retrieved successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(@PathVariable("id") String id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Resume deleted successfully"));
    }

    @PutMapping("/{id}/rename")
    public ResponseEntity<ApiResponse<ResumeResponse>> renameResume(
            @PathVariable("id") String id, 
            @RequestBody Map<String, String> body) {
        String newName = body.get("name");
        ResumeResponse response = resumeService.renameResume(id, newName);
        return ResponseEntity.ok(ApiResponse.success(response, "Resume renamed successfully"));
    }

    @GetMapping("/versions/{versionId}")
    public ResponseEntity<ApiResponse<ResumeVersionResponse>> getVersion(@PathVariable("versionId") String versionId) {
        ResumeVersionResponse response = resumeService.getVersion(versionId);
        return ResponseEntity.ok(ApiResponse.success(response, "Resume version retrieved successfully"));
    }

    @PostMapping("/versions/{versionId}/duplicate")
    public ResponseEntity<ApiResponse<ResumeVersionResponse>> duplicateVersion(
            @PathVariable("versionId") String versionId,
            @RequestBody Map<String, String> body) {
        String newName = body.get("name");
        ResumeVersionResponse response = resumeService.duplicateVersion(versionId, newName);
        return ResponseEntity.ok(ApiResponse.success(response, "Resume version duplicated successfully"));
    }
}
