package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.entity.ResumeAnalysis;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportGeneratorService {

    private final ObjectMapper objectMapper;

    private static final float MARGIN = 50f;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final float USABLE_WIDTH = PAGE_WIDTH - (2 * MARGIN);

    public byte[] generatePdfReport(ResumeAnalysis analysis) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDFont fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDFont fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDFont fontOblique = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

            PdfContext ctx = new PdfContext(document, fontBold, fontRegular, fontOblique);
            ctx.newPage();

            // Header Banner
            ctx.drawHeader("AI RESUME ATS AUDIT REPORT");

            // Metadata section
            String resumeName = analysis.getResumeVersion() != null && analysis.getResumeVersion().getResume() != null
                    ? analysis.getResumeVersion().getResume().getFilename() : "Resume";
            int versionNum = analysis.getResumeVersion() != null ? analysis.getResumeVersion().getVersionNumber() : 1;
            String createdDate = analysis.getCreatedAt() != null
                    ? analysis.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) : "N/A";

            ctx.addKeyValue("Resume File", resumeName + " (v" + versionNum + ")");
            ctx.addKeyValue("Generated On", createdDate);
            if (analysis.getJobDescription() != null) {
                String jobTitle = analysis.getJobDescription().getTitle();
                String company = analysis.getJobDescription().getCompany();
                ctx.addKeyValue("Target Role", jobTitle + (company != null ? " at " + company : ""));
            }
            ctx.addSpacing(15);

            // Scores Overview Box
            ctx.drawScoresSummary(analysis.getAtsScore() != null ? analysis.getAtsScore() : 0,
                    analysis.getJobMatchScore());

            // Section Scores Breakdown
            if (analysis.getSectionScoresJson() != null) {
                ctx.addSectionHeading("1. Section Score Breakdown");
                JsonNode sectionScores = parseJson(analysis.getSectionScoresJson());
                if (sectionScores != null && sectionScores.isArray()) {
                    for (JsonNode sec : sectionScores) {
                        String name = sec.has("category") ? sec.path("category").asText() : sec.path("name").asText("Section");
                        int score = sec.path("score").asInt(0);
                        int maxScore = sec.path("maxScore").asInt(100);
                        String feedback = sec.has("reason") ? sec.path("reason").asText() : sec.path("feedback").asText("");
                        ctx.addBullet(name + " (" + score + "/" + maxScore + "): " + feedback);
                    }
                }
                ctx.addSpacing(10);
            }

            // Keyword & Skills Analysis
            if (analysis.getKeywordAnalysisJson() != null) {
                ctx.addSectionHeading("2. Keyword & Skills Match");
                JsonNode keywords = parseJson(analysis.getKeywordAnalysisJson());
                if (keywords != null && keywords.isArray()) {
                    List<String> matched = new ArrayList<>();
                    List<String> missing = new ArrayList<>();
                    for (JsonNode kw : keywords) {
                        String term = kw.path("keyword").asText();
                        String status = kw.path("status").asText();
                        if ("Found".equalsIgnoreCase(status) || "Strong".equalsIgnoreCase(status)) {
                            matched.add(term);
                        } else if ("Missing".equalsIgnoreCase(status)) {
                            missing.add(term);
                        }
                    }
                    if (!matched.isEmpty()) {
                        ctx.addBullet("Matched Skills: " + String.join(", ", matched));
                    }
                    if (!missing.isEmpty()) {
                        ctx.addBullet("Missing / Desired Skills: " + String.join(", ", missing));
                    }
                }
                ctx.addSpacing(10);
            }

            // Formatting & Grammar Issues
            if (analysis.getFormattingIssuesJson() != null || analysis.getGrammarAnalysisJson() != null) {
                ctx.addSectionHeading("3. Detected Issues & Observations");
                JsonNode formatting = parseJson(analysis.getFormattingIssuesJson());
                if (formatting != null && formatting.isArray()) {
                    for (JsonNode item : formatting) {
                        String severity = item.has("type") ? item.path("type").asText() : item.path("severity").asText("INFO");
                        String issue = item.has("title") ? item.path("title").asText() : item.path("issue").asText("");
                        String detail = item.has("suggestion") ? item.path("suggestion").asText() : item.path("detail").asText("");
                        ctx.addBullet("[" + severity + "] Formatting: " + (issue.isEmpty() ? "" : issue + " - ") + detail);
                    }
                }

                JsonNode grammar = parseJson(analysis.getGrammarAnalysisJson());
                if (grammar != null && grammar.isArray()) {
                    for (JsonNode item : grammar) {
                        String original = item.path("original").asText("");
                        String suggestion = item.has("suggested") ? item.path("suggested").asText() : item.path("suggestion").asText("");
                        String reason = item.path("reason").asText("");
                        ctx.addBullet("Language: Replace \"" + original + "\" with \"" + suggestion + "\" (" + reason + ")");
                    }
                }
                ctx.addSpacing(10);
            }

            // Recommendations
            if (analysis.getImprovementsJson() != null) {
                ctx.addSectionHeading("4. Actionable Improvement Suggestions");
                JsonNode improvements = parseJson(analysis.getImprovementsJson());
                if (improvements != null && improvements.isArray()) {
                    for (JsonNode imp : improvements) {
                        String category = imp.has("section") ? imp.path("section").asText() : imp.path("category").asText("Improvement");
                        String suggestion = imp.path("suggestion").asText("");
                        ctx.addBullet(category + ": " + suggestion);
                    }
                }
                ctx.addSpacing(10);
            }

            // Role Recommendations
            if (analysis.getRoleRecommendationsJson() != null) {
                ctx.addSectionHeading("5. Target Role Matches");
                JsonNode roles = parseJson(analysis.getRoleRecommendationsJson());
                if (roles != null && roles.isArray()) {
                    for (JsonNode role : roles) {
                        String title = role.has("role") ? role.path("role").asText() : role.path("roleTitle").asText();
                        int match = role.path("matchPercentage").asInt(0);
                        String reason = role.path("reason").asText("");
                        ctx.addBullet(title + " (" + match + "% Match): " + reason);
                    }
                }
            }

            ctx.closeCurrentStream();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private JsonNode parseJson(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        try {
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.warn("Failed to parse JSON for PDF report: {}", e.getMessage());
            return null;
        }
    }

    private static String sanitize(String text) {
        if (text == null) return "";
        return text.replace("\u2022", "*")
                .replace("\u2013", "-")
                .replace("\u2014", "--")
                .replace("\u201C", "\"")
                .replace("\u201D", "\"")
                .replace("\u2018", "'")
                .replace("\u2019", "'")
                .replaceAll("[^\\x20-\\x7E]", " ")
                .trim();
    }

    private static class PdfContext {
        private final PDDocument document;
        private final PDFont fontBold;
        private final PDFont fontRegular;
        private final PDFont fontOblique;
        private PDPageContentStream currentStream;
        private float currentY;

        public PdfContext(PDDocument document, PDFont fontBold, PDFont fontRegular, PDFont fontOblique) {
            this.document = document;
            this.fontBold = fontBold;
            this.fontRegular = fontRegular;
            this.fontOblique = fontOblique;
        }

        public void newPage() throws IOException {
            closeCurrentStream();
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            currentStream = new PDPageContentStream(document, page);
            currentY = PAGE_HEIGHT - MARGIN;
        }

        public void closeCurrentStream() throws IOException {
            if (currentStream != null) {
                currentStream.close();
                currentStream = null;
            }
        }

        private void ensureSpace(float requiredHeight) throws IOException {
            if (currentY - requiredHeight < MARGIN) {
                newPage();
            }
        }

        public void drawHeader(String title) throws IOException {
            ensureSpace(50);
            currentStream.setNonStrokingColor(30 / 255f, 41 / 255f, 59 / 255f); // Slate-800
            currentStream.addRect(MARGIN, currentY - 28, USABLE_WIDTH, 32);
            currentStream.fill();

            currentStream.beginText();
            currentStream.setFont(fontBold, 16);
            currentStream.setNonStrokingColor(1f, 1f, 1f); // White
            currentStream.newLineAtOffset(MARGIN + 12, currentY - 18);
            currentStream.showText(title);
            currentStream.endText();

            currentY -= 45;
        }

        public void addKeyValue(String key, String value) throws IOException {
            ensureSpace(16);
            currentStream.beginText();
            currentStream.setFont(fontBold, 10);
            currentStream.setNonStrokingColor(71 / 255f, 85 / 255f, 105 / 255f); // Slate-600
            currentStream.newLineAtOffset(MARGIN, currentY);
            currentStream.showText(key + ": ");
            currentStream.setFont(fontRegular, 10);
            currentStream.setNonStrokingColor(15 / 255f, 23 / 255f, 42 / 255f); // Slate-900
            currentStream.showText(sanitize(value));
            currentStream.endText();
            currentY -= 15;
        }

        public void drawScoresSummary(int atsScore, Integer jobMatchScore) throws IOException {
            ensureSpace(60);
            float boxWidth = jobMatchScore != null ? (USABLE_WIDTH - 20) / 2 : USABLE_WIDTH;

            // Box 1: Overall ATS Score
            drawScoreBox(MARGIN, currentY - 50, boxWidth, 50, "OVERALL ATS SCORE", atsScore + "/100",
                    atsScore >= 75 ? "EXCELLENT" : (atsScore >= 50 ? "AVERAGE" : "NEEDS WORK"));

            // Box 2: Job Match Score
            if (jobMatchScore != null) {
                drawScoreBox(MARGIN + boxWidth + 20, currentY - 50, boxWidth, 50, "JOB MATCH COMPATIBILITY",
                        jobMatchScore + "%", jobMatchScore >= 75 ? "STRONG MATCH" : "MODERATE");
            }

            currentY -= 70;
        }

        private void drawScoreBox(float x, float y, float width, float height, String title, String score, String badge)
                throws IOException {
            currentStream.setNonStrokingColor(241 / 255f, 245 / 255f, 249 / 255f); // Slate-100
            currentStream.addRect(x, y, width, height);
            currentStream.fill();

            currentStream.setStrokingColor(203 / 255f, 213 / 255f, 225 / 255f); // Slate-300
            currentStream.addRect(x, y, width, height);
            currentStream.stroke();

            currentStream.beginText();
            currentStream.setFont(fontBold, 9);
            currentStream.setNonStrokingColor(100 / 255f, 116 / 255f, 139 / 255f);
            currentStream.newLineAtOffset(x + 10, y + height - 16);
            currentStream.showText(title);

            currentStream.setFont(fontBold, 18);
            currentStream.setNonStrokingColor(15 / 255f, 23 / 255f, 42 / 255f);
            currentStream.newLineAtOffset(0, -18);
            currentStream.showText(score);

            currentStream.setFont(fontOblique, 8);
            currentStream.setNonStrokingColor(79 / 255f, 70 / 255f, 229 / 255f); // Indigo-600
            currentStream.showText("  [" + badge + "]");
            currentStream.endText();
        }

        public void addSectionHeading(String heading) throws IOException {
            ensureSpace(30);
            currentStream.beginText();
            currentStream.setFont(fontBold, 12);
            currentStream.setNonStrokingColor(30 / 255f, 41 / 255f, 59 / 255f);
            currentStream.newLineAtOffset(MARGIN, currentY);
            currentStream.showText(heading);
            currentStream.endText();

            currentStream.setStrokingColor(226 / 255f, 232 / 255f, 240 / 255f);
            currentStream.moveTo(MARGIN, currentY - 4);
            currentStream.lineTo(PAGE_WIDTH - MARGIN, currentY - 4);
            currentStream.stroke();

            currentY -= 18;
        }

        public void addBullet(String text) throws IOException {
            String clean = sanitize(text);
            List<String> wrappedLines = wrapText(clean, fontRegular, 9.5f, USABLE_WIDTH - 20);

            for (int i = 0; i < wrappedLines.size(); i++) {
                ensureSpace(14);
                currentStream.beginText();
                currentStream.setFont(fontRegular, 9.5f);
                currentStream.setNonStrokingColor(51 / 255f, 65 / 255f, 85 / 255f);
                if (i == 0) {
                    currentStream.newLineAtOffset(MARGIN + 5, currentY);
                    currentStream.showText("-  " + wrappedLines.get(i));
                } else {
                    currentStream.newLineAtOffset(MARGIN + 16, currentY);
                    currentStream.showText(wrappedLines.get(i));
                }
                currentStream.endText();
                currentY -= 13;
            }
        }

        public void addSpacing(float spacing) {
            currentY -= spacing;
        }

        private List<String> wrapText(String text, PDFont font, float fontSize, float maxWidth) throws IOException {
            List<String> lines = new ArrayList<>();
            String[] words = text.split("\\s+");
            StringBuilder currentLine = new StringBuilder();

            for (String word : words) {
                String candidate = currentLine.length() == 0 ? word : currentLine + " " + word;
                float width = font.getStringWidth(candidate) / 1000 * fontSize;
                if (width > maxWidth && currentLine.length() > 0) {
                    lines.add(currentLine.toString());
                    currentLine = new StringBuilder(word);
                } else {
                    currentLine = new StringBuilder(candidate);
                }
            }
            if (currentLine.length() > 0) {
                lines.add(currentLine.toString());
            }
            return lines;
        }
    }
}
