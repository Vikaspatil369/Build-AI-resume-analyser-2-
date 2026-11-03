package com.airesumeanalyzer.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeResponse {
    private String id;
    private String filename;
    private String fileType;
    private Integer latestVersionNumber;
    private String latestVersionId;
    private List<ResumeVersionResponse> versions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
