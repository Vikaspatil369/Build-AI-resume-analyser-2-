package com.airesumeanalyzer.backend.controller;

import com.airesumeanalyzer.backend.dto.ApiResponse;
import com.airesumeanalyzer.backend.dto.JobDescriptionRequest;
import com.airesumeanalyzer.backend.dto.JobDescriptionResponse;
import com.airesumeanalyzer.backend.service.JobDescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobDescriptionService jobDescriptionService;

    @PostMapping
    public ResponseEntity<ApiResponse<JobDescriptionResponse>> createJobDescription(
            @Valid @RequestBody JobDescriptionRequest request) {
        JobDescriptionResponse response = jobDescriptionService.createJobDescription(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Job description saved and parsed successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobDescriptionResponse>>> listAllJobDescriptions() {
        List<JobDescriptionResponse> response = jobDescriptionService.listAllJobDescriptions();
        return ResponseEntity.ok(ApiResponse.success(response, "Job descriptions retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobDescriptionResponse>> getJobDescription(@PathVariable("id") String id) {
        JobDescriptionResponse response = jobDescriptionService.getJobDescription(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Job description retrieved successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJobDescription(@PathVariable("id") String id) {
        jobDescriptionService.deleteJobDescription(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Job description deleted successfully"));
    }
}
