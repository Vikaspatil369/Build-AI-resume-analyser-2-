package com.airesumeanalyzer.backend.dto.parser;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedJobDescription {
    private String jobTitle;
    private String company;
    private List<String> requiredSkills;
    private List<String> preferredSkills;
    private List<String> technicalKeywords;
    private List<String> softSkills;
    private Integer minYearsExperience;
    private String educationRequirement;
    private List<String> toolsAndFrameworks;
    private List<String> certifications;
}
