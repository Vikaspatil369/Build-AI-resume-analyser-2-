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
public class ExperienceItem {
    private String company;
    private String role;
    private String startDate;
    private String endDate;
    private List<String> responsibilities;
    private List<String> achievements;
}
