package com.airesumeanalyzer.backend;

import com.airesumeanalyzer.backend.dto.parser.*;
import com.airesumeanalyzer.backend.entity.ResumeAnalysis;
import com.airesumeanalyzer.backend.service.MockAIServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MockAIServiceImplTest {

    private MockAIServiceImpl mockAIService;

    @BeforeEach
    void setUp() {
        mockAIService = new MockAIServiceImpl();
    }

    @Test
    void testParseResume() {
        String text = "John Doe\njohndoe@example.com\n+1 (555) 123-4567\nlinkedin.com/in/johndoe\nSkills: Java, Python, Docker";
        ParsedResume parsed = mockAIService.parseResume(text);

        assertNotNull(parsed);
        assertEquals("John Doe", parsed.getPersonalInfo().getName());
        assertEquals("johndoe@example.com", parsed.getPersonalInfo().getEmail());
        assertTrue(parsed.getSkills().contains("Java"));
        assertTrue(parsed.getSkills().contains("Python"));
        assertTrue(parsed.getSkills().contains("Docker"));
    }

    @Test
    void testParseJobDescription() {
        String text = "We need a Senior Backend Java Engineer who knows Spring Boot and Docker.";
        ParsedJobDescription jd = mockAIService.parseJobDescription(text);

        assertNotNull(jd);
        assertEquals("Backend Engineer", jd.getJobTitle());
        assertTrue(jd.getRequiredSkills().contains("Java"));
        assertTrue(jd.getRequiredSkills().contains("Spring Boot"));
        assertTrue(jd.getRequiredSkills().contains("Docker"));
    }

    @Test
    void testAnalyzeResumeAgainstJob() {
        ParsedResume resume = mockAIService.parseResume("John Doe\nSkills: Java, Spring Boot, Git");
        ParsedJobDescription jd = mockAIService.parseJobDescription("Required skills: Java, Spring Boot, Git, Docker");

        ResumeAnalysis analysis = mockAIService.analyzeResumeAgainstJob(resume, "Raw Resume Text", jd, "Raw Job Text");

        assertNotNull(analysis);
        assertNotNull(analysis.getId());
        assertTrue(analysis.getAtsScore() > 0 && analysis.getAtsScore() <= 100);
        assertTrue(analysis.getJobMatchScore() > 0 && analysis.getJobMatchScore() <= 100);
        assertNotNull(analysis.getSkillGapJson());
        assertNotNull(analysis.getKeywordAnalysisJson());
    }
}
