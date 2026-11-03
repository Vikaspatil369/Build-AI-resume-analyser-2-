package com.airesumeanalyzer.backend.dto.parser;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EducationItem {
    private String institution;
    private String degree;
    private String fieldOfStudy;
    private String startYear;
    private String endYear;
    private String gpa;
}
