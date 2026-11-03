package com.airesumeanalyzer.backend.controller;

import com.airesumeanalyzer.backend.dto.AdminStatsResponse;
import com.airesumeanalyzer.backend.dto.ApiResponse;
import com.airesumeanalyzer.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getSystemStatistics() {
        AdminStatsResponse response = adminService.getSystemStatistics();
        return ResponseEntity.ok(ApiResponse.success(response, "System statistics retrieved successfully"));
    }
}
