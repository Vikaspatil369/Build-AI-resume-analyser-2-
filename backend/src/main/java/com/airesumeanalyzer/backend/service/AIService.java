package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.parser.ParsedJobDescription;
import com.airesumeanalyzer.backend.dto.parser.ParsedResume;
import com.airesumeanalyzer.backend.entity.ResumeAnalysis;

public interface AIService {
    ParsedResume parseResume(String rawText);
    ParsedJobDescription parseJobDescription(String rawText);
    ResumeAnalysis analyzeResumeAgainstJob(ParsedResume resume, String rawResumeText, ParsedJobDescription jobDesc, String rawJobDescText);
    ResumeAnalysis analyzeResumeStandalone(ParsedResume resume, String rawResumeText);
}
