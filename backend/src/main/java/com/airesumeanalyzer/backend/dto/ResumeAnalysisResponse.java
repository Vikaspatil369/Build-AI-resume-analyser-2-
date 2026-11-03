package com.airesumeanalyzer.backend.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysisResponse {
    private String id;
    private String resumeId;
    private String resumeName;
    private String versionId;
    private Integer versionNumber;
    private String jobId;
    private String jobTitle;
    private String jobCompany;
    private String status;
    private Integer atsScore;
    private Integer jobMatchScore;
    
    // Raw JSON string representations for direct, faithful serialization
    @JsonRawValue
    private String sectionScores;
    @JsonRawValue
    private String keywordAnalysis;
    @JsonRawValue
    private String skillGap;
    @JsonRawValue
    private String formattingIssues;
    @JsonRawValue
    private String grammarAnalysis;
    @JsonRawValue
    private String improvements;
    @JsonRawValue
    private String roleRecommendations;
    
    private String errorMessage;
    private LocalDateTime createdAt;
}
