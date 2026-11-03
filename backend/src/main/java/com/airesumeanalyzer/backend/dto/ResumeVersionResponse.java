package com.airesumeanalyzer.backend.dto;

import com.airesumeanalyzer.backend.dto.parser.ParsedResume;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeVersionResponse {
    private String id;
    private String resumeId;
    private String name;
    private Integer versionNumber;
    private ParsedResume parsedContent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
