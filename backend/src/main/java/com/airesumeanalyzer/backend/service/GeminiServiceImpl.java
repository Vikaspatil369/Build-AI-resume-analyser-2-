package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.parser.*;
import com.airesumeanalyzer.backend.entity.AnalysisStatus;
import com.airesumeanalyzer.backend.entity.ResumeAnalysis;
import com.airesumeanalyzer.backend.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "gemini")
@RequiredArgsConstructor
@Slf4j
public class GeminiServiceImpl implements AIService {

    @Value("${app.ai.gemini.api-key}")
    private String apiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String callGemini(String prompt) {
        log.debug("Calling Gemini model: {}", model);
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "AI_CONFIG_ERROR", "Gemini API key is not configured.");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Body format for Gemini generateContent API
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", List.of(textPart));

        Map<String, Object> content = new HashMap<>();
        content.put("contents", List.of(parts));

        // Generation config for JSON output
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        content.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(content, headers);

        try {
            ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                return parseGeminiTextResponse(responseEntity.getBody());
            } else {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "AI_SERVICE_ERROR", "Invalid response from Gemini API");
            }
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "AI_SERVICE_ERROR", "Failed to contact Gemini AI: " + e.getMessage());
        }
    }

    private String parseGeminiTextResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");
            return textNode.asText();
        } catch (Exception e) {
            log.error("Failed to parse Gemini response payload: {}", responseBody, e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "AI_PARSE_ERROR", "Failed to parse Gemini AI response structure");
        }
    }

    @Override
    public ParsedResume parseResume(String rawText) {
        String prompt = "You are a professional resume parser. Extract structured information from the following raw resume text and return it strictly in JSON format. " +
                "Do not include any explanation or backticks. Return a JSON object with this schema: \n" +
                "{\n" +
                "  \"personalInfo\": {\n" +
                "    \"name\": \"Name\", \"email\": \"Email\", \"phone\": \"Phone\", \"linkedin\": \"LinkedIn URL\", \"github\": \"GitHub URL\", \"portfolio\": \"Portfolio URL\"\n" +
                "  },\n" +
                "  \"professionalSummary\": \"Professional Summary\",\n" +
                "  \"skills\": [\"Skill1\", \"Skill2\"],\n" +
                "  \"experience\": [\n" +
                "    {\n" +
                "      \"company\": \"Company Name\", \"role\": \"Role Title\", \"startDate\": \"Start Date\", \"endDate\": \"End Date or Present\",\n" +
                "      \"responsibilities\": [\"Responsibility 1\"], \"achievements\": [\"Achievement 1 (e.g., metric-based if present)\"]\n" +
                "    }\n" +
                "  ],\n" +
                "  \"education\": [\n" +
                "    {\n" +
                "      \"institution\": \"School/University Name\", \"degree\": \"Degree Type\", \"fieldOfStudy\": \"Field of Study\", \"startYear\": \"Start Year\", \"endYear\": \"End Year\", \"gpa\": \"GPA if present\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"projects\": [\n" +
                "    {\n" +
                "      \"name\": \"Project Name\", \"description\": \"Description\", \"technologies\": [\"Tech1\"], \"achievements\": [\"Result or Metric\"]\n" +
                "    }\n" +
                "  ],\n" +
                "  \"certifications\": [\"Cert1\"],\n" +
                "  \"languages\": [\"Language1 (Fluency)\"]\n" +
                "}\n\n" +
                "Resume Raw Text:\n" + rawText;

        try {
            String jsonResponse = callGemini(prompt);
            return objectMapper.readValue(jsonResponse, ParsedResume.class);
        } catch (Exception e) {
            log.error("Failed to parse resume via Gemini: {}", e.getMessage());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "AI_PARSE_ERROR", "Failed to parse resume text using AI.");
        }
    }

    @Override
    public ParsedJobDescription parseJobDescription(String rawText) {
        String prompt = "You are a recruitment assistant. Parse the following job description and extract structured keywords/information. Return strictly in JSON format matching this schema:\n" +
                "{\n" +
                "  \"jobTitle\": \"Job Title\",\n" +
                "  \"company\": \"Company Name if present\",\n" +
                "  \"requiredSkills\": [\"Skill1\"],\n" +
                "  \"preferredSkills\": [\"Skill1\"],\n" +
                "  \"technicalKeywords\": [\"Keyword1\"],\n" +
                "  \"softSkills\": [\"Skill1\"],\n" +
                "  \"minYearsExperience\": 0,\n" +
                "  \"educationRequirement\": \"Education Requirement\",\n" +
                "  \"toolsAndFrameworks\": [\"Tool1\"],\n" +
                "  \"certifications\": [\"Cert1\"]\n" +
                "}\n\n" +
                "Job Description Raw Text:\n" + rawText;

        try {
            String jsonResponse = callGemini(prompt);
            return objectMapper.readValue(jsonResponse, ParsedJobDescription.class);
        } catch (Exception e) {
            log.error("Failed to parse job description via Gemini: {}", e.getMessage());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "AI_PARSE_ERROR", "Failed to parse job description using AI.");
        }
    }

    @Override
    public ResumeAnalysis analyzeResumeAgainstJob(ParsedResume resume, String rawResumeText, ParsedJobDescription jobDesc, String rawJobDescText) {
        String prompt = "You are a Senior ATS Expert and Technical Recruiter. Analyze the following resume against the job description. " +
                "Return strictly in JSON format. Do not fabricate experience, companies, projects, or certifications. " +
                "Score categories deterministically from 0 to 100 based on standard weights: " +
                "Keyword relevance (25 pts), Skills match (20 pts), Experience relevance (20 pts), Resume structure (10 pts), Formatting (10 pts), Achievements/impact (10 pts), Contact info (5 pts). " +
                "Do not recommend keyword stuffing; warn explicitly. Explain all scores. " +
                "Return a JSON object conforming exactly to this schema:\n" +
                "{\n" +
                "  \"atsScore\": 84,\n" +
                "  \"jobMatchScore\": 87,\n" +
                "  \"sectionScores\": [\n" +
                "    { \"category\": \"Keyword Relevance\", \"score\": 21, \"maxScore\": 25, \"reason\": \"Explanation\" }\n" +
                "  ],\n" +
                "  \"keywords\": [\n" +
                "    { \"keyword\": \"Spring Boot\", \"status\": \"Missing\", \"importance\": \"High\", \"resumeFrequency\": 0, \"jdFrequency\": 5, \"section\": \"Skills\" }\n" +
                "  ],\n" +
                "  \"skillGaps\": [\n" +
                "    { \"skill\": \"Spring Boot\", \"level\": \"MISSING\", \"learningPriority\": \"HIGH\" }\n" +
                "  ],\n" +
                "  \"formattingIssues\": [\n" +
                "    { \"type\": \"WARNING\", \"title\": \"Columns check\", \"suggestion\": \"Use single column\" }\n" +
                "  ],\n" +
                "  \"grammarIssues\": [\n" +
                "    { \"original\": \"original text\", \"suggested\": \"corrected text\", \"reason\": \"explanation\" }\n" +
                "  ],\n" +
                "  \"improvements\": [\n" +
                "    { \"section\": \"Experience\", \"suggestion\": \"Actionable recommendation\" }\n" +
                "  ],\n" +
                "  \"roles\": [\n" +
                "    { \"role\": \"Recommended Role Name\", \"matchPercentage\": 90, \"reason\": \"Explanation\" }\n" +
                "  ]\n" +
                "}\n\n" +
                "Resume JSON: " + writeJson(resume) + "\n\n" +
                "Job Description JSON: " + writeJson(jobDesc) + "\n\n" +
                "Resume Raw Text: " + rawResumeText + "\n\n" +
                "Job Description Raw Text: " + rawJobDescText;

        try {
            String jsonResponse = callGemini(prompt);
            JsonNode root = objectMapper.readTree(jsonResponse);
            
            return ResumeAnalysis.builder()
                    .id(UUID.randomUUID().toString())
                    .status(AnalysisStatus.COMPLETED)
                    .atsScore(root.path("atsScore").asInt())
                    .jobMatchScore(root.path("jobMatchScore").asInt())
                    .sectionScoresJson(objectMapper.writeValueAsString(root.path("sectionScores")))
                    .keywordAnalysisJson(objectMapper.writeValueAsString(root.path("keywords")))
                    .skillGapJson(objectMapper.writeValueAsString(root.path("skillGaps")))
                    .formattingIssuesJson(objectMapper.writeValueAsString(root.path("formattingIssues")))
                    .grammarAnalysisJson(objectMapper.writeValueAsString(root.path("grammarIssues")))
                    .improvementsJson(objectMapper.writeValueAsString(root.path("improvements")))
                    .roleRecommendationsJson(objectMapper.writeValueAsString(root.path("roles")))
                    .build();
        } catch (Exception e) {
            log.error("Failed to analyze resume via Gemini: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "AI_ANALYSIS_ERROR", "Failed to run AI analysis on the resume.");
        }
    }

    @Override
    public ResumeAnalysis analyzeResumeStandalone(ParsedResume resume, String rawResumeText) {
        // Construct a generic job analysis
        ParsedJobDescription mockJd = parseJobDescription("Provide a generic role matching the skills: " + String.join(", ", resume.getSkills()));
        return analyzeResumeAgainstJob(resume, rawResumeText, mockJd, "");
    }

    private String writeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "";
        }
    }
}
