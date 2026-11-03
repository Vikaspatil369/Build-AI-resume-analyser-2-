package com.airesumeanalyzer.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobDescriptionRequest {

    @NotBlank(message = "Job title is required")
    private String title;

    private String company;

    @NotBlank(message = "Job description text is required")
    private String rawText;
}
