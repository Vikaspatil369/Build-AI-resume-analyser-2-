package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.AdminStatsResponse;

public interface AdminService {
    AdminStatsResponse getSystemStatistics();
}
