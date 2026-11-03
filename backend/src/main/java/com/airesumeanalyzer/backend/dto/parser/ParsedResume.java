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
public class ParsedResume {
    private PersonalInfo personalInfo;
    private String professionalSummary;
    private List<String> skills;
    private List<ExperienceItem> experience;
    private List<EducationItem> education;
    private List<ProjectItem> projects;
    private List<String> certifications;
    private List<String> languages;
}
