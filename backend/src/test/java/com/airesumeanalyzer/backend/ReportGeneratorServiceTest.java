package com.airesumeanalyzer.backend;

import com.airesumeanalyzer.backend.entity.Resume;
import com.airesumeanalyzer.backend.entity.ResumeAnalysis;
import com.airesumeanalyzer.backend.entity.ResumeVersion;
import com.airesumeanalyzer.backend.service.ReportGeneratorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class ReportGeneratorServiceTest {

    private ReportGeneratorService reportGeneratorService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        reportGeneratorService = new ReportGeneratorService(objectMapper);
    }

    @Test
    void testGeneratePdfReport() throws IOException {
        Resume resume = Resume.builder()
                .filename("Alex_Smith_Resume.pdf")
                .fileType("PDF")
                .build();

        ResumeVersion version = ResumeVersion.builder()
                .resume(resume)
                .versionNumber(1)
                .name("v1_Initial")
                .build();

        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .resumeVersion(version)
                .atsScore(88)
                .jobMatchScore(92)
                .createdAt(LocalDateTime.now())
                .sectionScoresJson("[{\"name\":\"Skills\",\"score\":20,\"maxScore\":20,\"feedback\":\"Excellent\"}]")
                .keywordAnalysisJson("[{\"keyword\":\"Java\",\"status\":\"Found\"},{\"keyword\":\"AWS\",\"status\":\"Missing\"}]")
                .improvementsJson("[{\"category\":\"Summary\",\"suggestion\":\"Highlight cloud experience\"}]")
                .roleRecommendationsJson("[{\"roleTitle\":\"Senior Java Engineer\",\"matchPercentage\":95,\"reason\":\"Strong background\"}]")
                .build();

        byte[] pdfBytes = reportGeneratorService.generatePdfReport(analysis);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500, "PDF bytes should be populated");
        
        // Verify PDF Magic header %PDF-
        String header = new String(pdfBytes, 0, 5);
        assertEquals("%PDF-", header);
    }
}
