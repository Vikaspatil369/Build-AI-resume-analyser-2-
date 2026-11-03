package com.airesumeanalyzer.backend.dto;

import com.airesumeanalyzer.backend.dto.parser.ParsedJobDescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescriptionResponse {
    private String id;
    private String title;
    private String company;
    private String rawText;
    private ParsedJobDescription parsedKeywords;
    private LocalDateTime createdAt;
}
