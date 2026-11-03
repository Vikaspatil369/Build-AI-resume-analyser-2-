package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.parser.*;
import com.airesumeanalyzer.backend.entity.AnalysisStatus;
import com.airesumeanalyzer.backend.entity.ResumeAnalysis;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "mock", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class MockAIServiceImpl implements AIService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ParsedResume parseResume(String rawText) {
        log.info("Parsing resume using Mock AIService");

        String name = extractName(rawText);
        String email = extractEmail(rawText);
        String phone = extractPhone(rawText);
        String linkedin = extractLinkedin(rawText);
        String github = extractGithub(rawText);
        
        List<String> detectedSkills = detectSkills(rawText);
        List<ExperienceItem> experience = extractMockExperience(rawText);
        List<EducationItem> education = extractMockEducation(rawText);
        List<ProjectItem> projects = extractMockProjects(rawText);

        PersonalInfo personalInfo = PersonalInfo.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .linkedin(linkedin.isEmpty() ? "linkedin.com/in/johndoe" : linkedin)
                .github(github.isEmpty() ? "github.com/johndoe" : github)
                .portfolio("johndoe.dev")
                .build();

        return ParsedResume.builder()
                .personalInfo(personalInfo)
                .professionalSummary("Experienced Software Engineer specialized in building scalable backend services and responsive frontend applications. Proficient in Java, Spring Boot, and cloud technologies.")
                .skills(detectedSkills)
                .experience(experience)
                .education(education)
                .projects(projects)
                .certifications(Arrays.asList("AWS Certified Solutions Architect", "Oracle Certified Professional Java SE 11"))
                .languages(Arrays.asList("English (Native)", "Spanish (Conversational)"))
                .build();
    }

    @Override
    public ParsedJobDescription parseJobDescription(String rawText) {
        log.info("Parsing job description using Mock AIService");
        
        String jobTitle = "Senior Software Engineer";
        if (rawText.toLowerCase().contains("backend")) {
            jobTitle = "Backend Engineer";
        } else if (rawText.toLowerCase().contains("frontend")) {
            jobTitle = "Frontend Engineer";
        } else if (rawText.toLowerCase().contains("full stack") || rawText.toLowerCase().contains("fullstack")) {
            jobTitle = "Full Stack Engineer";
        }

        List<String> requiredSkills = detectSkills(rawText);
        if (requiredSkills.isEmpty()) {
            requiredSkills = Arrays.asList("Java", "Spring Boot", "MySQL", "REST APIs", "Git");
        }

        return ParsedJobDescription.builder()
                .jobTitle(jobTitle)
                .company("Global Tech Corp")
                .requiredSkills(requiredSkills)
                .preferredSkills(Arrays.asList("Docker", "AWS", "Kubernetes", "Microservices"))
                .technicalKeywords(requiredSkills)
                .softSkills(Arrays.asList("Communication", "Leadership", "Problem Solving", "Teamwork"))
                .minYearsExperience(rawText.toLowerCase().contains("senior") ? 5 : 2)
                .educationRequirement("Bachelor's degree in Computer Science or related field")
                .toolsAndFrameworks(Arrays.asList("Maven", "Junit", "Git", "Docker"))
                .certifications(Arrays.asList("AWS Solutions Architect"))
                .build();
    }

    @Override
    public ResumeAnalysis analyzeResumeAgainstJob(ParsedResume resume, String rawResumeText, ParsedJobDescription jobDesc, String rawJobDescText) {
        log.info("Analyzing resume against job description using Mock AIService");
        
        List<String> resumeSkills = resume.getSkills().stream().map(String::toLowerCase).collect(Collectors.toList());
        List<String> jdSkills = jobDesc.getRequiredSkills().stream().map(String::toLowerCase).collect(Collectors.toList());
        List<String> preferredSkills = jobDesc.getPreferredSkills().stream().map(String::toLowerCase).collect(Collectors.toList());

        List<String> matched = new ArrayList<>();
        List<String> partial = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String skill : jdSkills) {
            if (resumeSkills.contains(skill)) {
                matched.add(capitalize(skill));
            } else {
                // Check if semantic match e.g. "springboot" vs "spring boot"
                boolean foundPartial = false;
                for (String resumeSkill : resumeSkills) {
                    if (resumeSkill.replace(" ", "").contains(skill.replace(" ", "")) ||
                            skill.replace(" ", "").contains(resumeSkill.replace(" ", ""))) {
                        partial.add(capitalize(skill));
                        foundPartial = true;
                        break;
                    }
                }
                if (!foundPartial) {
                    missing.add(capitalize(skill));
                }
            }
        }

        for (String skill : preferredSkills) {
            if (resumeSkills.contains(skill)) {
                matched.add(capitalize(skill));
            } else {
                missing.add(capitalize(skill));
            }
        }

        // Keywords analysis
        List<KeywordAnalysisItem> keywords = new ArrayList<>();
        for (String skill : matched) {
            keywords.add(new KeywordAnalysisItem(skill, "Found", "High", 3, 5, "Skills"));
        }
        for (String skill : partial) {
            keywords.add(new KeywordAnalysisItem(skill, "Partial", "Medium", 1, 3, "Skills"));
        }
        for (String skill : missing) {
            keywords.add(new KeywordAnalysisItem(skill, "Missing", "High", 0, 4, "Skills"));
        }

        // Skills Gap Priority
        List<SkillGapItem> skillGaps = new ArrayList<>();
        for (String skill : matched) {
            skillGaps.add(new SkillGapItem(skill, "STRONG", "LOW"));
        }
        for (String skill : partial) {
            skillGaps.add(new SkillGapItem(skill, "MODERATE", "MEDIUM"));
        }
        for (String skill : missing) {
            skillGaps.add(new SkillGapItem(skill, "MISSING", "HIGH"));
        }

        // Deterministic Scores
        int keywordScore = Math.max(10, (int) ((matched.size() + partial.size() * 0.5) / Math.max(1, jdSkills.size() + preferredSkills.size()) * 25));
        int skillsScore = Math.max(8, (int) (matched.size() / Math.max(1, jdSkills.size()) * 20));
        
        int expScore = 15;
        if (resume.getExperience() != null && !resume.getExperience().isEmpty()) {
            expScore = 20;
        }

        int contactScore = 0;
        PersonalInfo pi = resume.getPersonalInfo();
        if (pi.getName() != null) contactScore += 1;
        if (pi.getEmail() != null) contactScore += 1;
        if (pi.getPhone() != null) contactScore += 1;
        if (pi.getLinkedin() != null) contactScore += 1;
        if (pi.getGithub() != null || pi.getPortfolio() != null) contactScore += 1;

        int structScore = (resume.getExperience() != null ? 3 : 0) + 
                (resume.getEducation() != null ? 3 : 0) + 
                (resume.getSkills() != null ? 2 : 0) + 
                (resume.getProfessionalSummary() != null ? 2 : 0);

        int formatScore = 9; // Max 10
        int achievementsScore = 7;
        
        int totalScore = keywordScore + skillsScore + expScore + structScore + formatScore + achievementsScore + contactScore;
        totalScore = Math.min(100, Math.max(0, totalScore));

        int jobMatch = Math.min(100, (matched.size() * 100 + partial.size() * 50) / Math.max(1, jdSkills.size() + preferredSkills.size()));

        List<SectionScore> sectionScores = Arrays.asList(
                new SectionScore("Keyword Relevance", keywordScore, 25, "Most key skills matching the job description are present."),
                new SectionScore("Skills Match", skillsScore, 20, "Core technical skills requirements are met."),
                new SectionScore("Experience Relevance", expScore, 20, "Relevant professional experiences detected."),
                new SectionScore("Structure", structScore, 10, "Standard resume sections are clearly structured."),
                new SectionScore("Formatting", formatScore, 10, "Layout is highly readable for ATS parsers."),
                new SectionScore("Achievements & Impact", achievementsScore, 10, "Bullet points include measurable results."),
                new SectionScore("Contact Information", contactScore, 5, "Necessary contact and professional links are provided.")
        );

        List<FormattingIssue> formattingIssues = Arrays.asList(
                new FormattingIssue("WARNING", "Multiple columns detected", "Consider using a single-column layout for maximum ATS compatibility."),
                new FormattingIssue("GOOD", "Standard headings", "Using standard section headings (Experience, Education, Skills).")
        );

        List<GrammarIssue> grammarIssues = Arrays.asList(
                new GrammarIssue("Worked on Java", "Led Java development", "Use stronger action verbs to emphasize ownership.")
        );

        List<ImprovementSuggestion> improvements = Arrays.asList(
                new ImprovementSuggestion("Professional Summary", "Customize summary to directly mention target role: " + jobDesc.getJobTitle()),
                new ImprovementSuggestion("Experience Bullets", "Incorporate more quantitative results e.g. 'Optimized APIs, reducing response times by 30%'.")
        );

        List<RoleRecommendation> roles = Arrays.asList(
                new RoleRecommendation(jobDesc.getJobTitle(), 92, "High skills alignment with required technologies."),
                new RoleRecommendation("Full Stack Engineer", 80, "Good backend proficiency combined with frontend awareness.")
        );

        try {
            return ResumeAnalysis.builder()
                    .id(UUID.randomUUID().toString())
                    .status(AnalysisStatus.COMPLETED)
                    .atsScore(totalScore)
                    .jobMatchScore(jobMatch)
                    .sectionScoresJson(objectMapper.writeValueAsString(sectionScores))
                    .keywordAnalysisJson(objectMapper.writeValueAsString(keywords))
                    .skillGapJson(objectMapper.writeValueAsString(skillGaps))
                    .formattingIssuesJson(objectMapper.writeValueAsString(formattingIssues))
                    .grammarAnalysisJson(objectMapper.writeValueAsString(grammarIssues))
                    .improvementsJson(objectMapper.writeValueAsString(improvements))
                    .roleRecommendationsJson(objectMapper.writeValueAsString(roles))
                    .build();
        } catch (Exception e) {
            log.error("Failed serialization: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResumeAnalysis analyzeResumeStandalone(ParsedResume resume, String rawResumeText) {
        log.info("Analyzing resume standalone using Mock AIService");
        return analyzeResumeAgainstJob(resume, rawResumeText, 
                parseJobDescription("Required skills: " + String.join(", ", resume.getSkills())), 
                "");
    }

    // Helper matchers
    private String extractName(String text) {
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            if (line.trim().length() > 2 && line.trim().length() < 30 && !line.contains("@") && !line.toLowerCase().contains("resume")) {
                return line.trim();
            }
        }
        return "John Doe";
    }

    private String extractEmail(String text) {
        Pattern pattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return "johndoe@example.com";
    }

    private String extractPhone(String text) {
        Pattern pattern = Pattern.compile("(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return "+1 (555) 123-4567";
    }

    private String extractLinkedin(String text) {
        Pattern pattern = Pattern.compile("linkedin\\.com/in/[a-zA-Z0-9-]+");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return "";
    }

    private String extractGithub(String text) {
        Pattern pattern = Pattern.compile("github\\.com/[a-zA-Z0-9-]+");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return "";
    }

    private List<String> detectSkills(String text) {
        List<String> knownSkills = Arrays.asList(
                "Java", "Python", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
                "Spring Boot", "Spring", "Django", "Flask", "Node.js", "Express", "React", "Angular", "Vue",
                "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra",
                "Docker", "Kubernetes", "AWS", "Azure", "GCP", "DevOps", "CI/CD",
                "Git", "REST APIs", "Microservices", "GraphQL", "Agile", "TypeScript", "JavaScript"
        );
        List<String> found = new ArrayList<>();
        String lowerText = text.toLowerCase();
        for (String skill : knownSkills) {
            String lowerSkill = skill.toLowerCase();
            // Use boundaries or basic word find
            if (lowerText.contains(lowerSkill)) {
                found.add(skill);
            }
        }
        return found.isEmpty() ? Arrays.asList("Java", "Spring Boot", "Git") : found;
    }

    private List<ExperienceItem> extractMockExperience(String text) {
        return Arrays.asList(
                ExperienceItem.builder()
                        .company("Tech Solutions Inc")
                        .role("Software Engineer")
                        .startDate("Jan 2023")
                        .endDate("Present")
                        .responsibilities(Arrays.asList(
                                "Developed RESTful microservices using Spring Boot and Java.",
                                "Designed and optimized MySQL database queries, improving performance by 25%.",
                                "Participated in Agile sprint planning and code reviews."
                        ))
                        .achievements(Arrays.asList(
                                "Migrated legacy monolith to Docker containers and deployed on AWS ECS."
                        ))
                        .build(),
                ExperienceItem.builder()
                        .company("Innovate Labs")
                        .role("Junior Backend Developer")
                        .startDate("Jun 2021")
                        .endDate("Dec 2022")
                        .responsibilities(Arrays.asList(
                                "Built API endpoints and integrated third-party payment gateways.",
                                "Wrote clean unit and integration tests using JUnit and Mockito."
                        ))
                        .achievements(new ArrayList<>())
                        .build()
        );
    }

    private List<EducationItem> extractMockEducation(String text) {
        return Arrays.asList(
                EducationItem.builder()
                        .institution("State University")
                        .degree("Bachelor of Science")
                        .fieldOfStudy("Computer Science")
                        .startYear("2017")
                        .endYear("2021")
                        .gpa("3.7/4.0")
                        .build()
        );
    }

    private List<ProjectItem> extractMockProjects(String text) {
        return Arrays.asList(
                ProjectItem.builder()
                        .name("E-Commerce Microservices")
                        .description("An online shopping system built on microservices architecture.")
                        .technologies(Arrays.asList("Java", "Spring Boot", "Docker", "RabbitMQ"))
                        .achievements(Arrays.asList("Implemented JWT auth across services, enhancing security."))
                        .build()
        );
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return text;
        String[] words = text.split(" ");
        return Arrays.stream(words)
                .map(word -> word.isEmpty() ? "" : Character.toUpperCase(word.charAt(0)) + word.substring(1))
                .collect(Collectors.joining(" "));
    }

    // Embed local classes for deserialization
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SectionScore {
        private String category;
        private int score;
        private int maxScore;
        private String reason;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class KeywordAnalysisItem {
        private String keyword;
        private String status; // Found, Partial, Missing
        private String importance; // High, Medium, Low
        private int resumeFrequency;
        private int jdFrequency;
        private String section;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SkillGapItem {
        private String skill;
        private String level; // STRONG, MODERATE, MISSING
        private String learningPriority; // HIGH, MEDIUM, LOW
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FormattingIssue {
        private String type; // CRITICAL, WARNING, GOOD
        private String title;
        private String suggestion;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class GrammarIssue {
        private String original;
        private String suggested;
        private String reason;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ImprovementSuggestion {
        private String section;
        private String suggestion;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RoleRecommendation {
        private String role;
        private int matchPercentage;
        private String reason;
    }
}
