package com.airesumeanalyzer.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalResumes;
    private double averageAtsScore;
    private int bestAtsScore;
    private double averageJobMatch;
    private List<ResumeAnalysisResponse> recentAnalyses;
}
