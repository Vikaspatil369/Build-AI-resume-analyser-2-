package com.airesumeanalyzer.backend.controller;

import com.airesumeanalyzer.backend.dto.ApiResponse;
import com.airesumeanalyzer.backend.dto.DashboardResponse;
import com.airesumeanalyzer.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardSummary() {
        DashboardResponse response = dashboardService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success(response, "Dashboard statistics retrieved successfully"));
    }
}
