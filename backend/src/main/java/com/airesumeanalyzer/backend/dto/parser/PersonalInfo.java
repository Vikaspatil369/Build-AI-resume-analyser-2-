package com.airesumeanalyzer.backend.dto.parser;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalInfo {
    private String name;
    private String email;
    private String phone;
    private String linkedin;
    private String github;
    private String portfolio;
}
