package com.airesumeanalyzer.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "resume_analyses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeAnalysis {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_version_id", nullable = false)
    private ResumeVersion resumeVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id")
    private JobDescription jobDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnalysisStatus status;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Column(name = "job_match_score")
    private Integer jobMatchScore;

    @Lob
    @Column(name = "section_scores_json", columnDefinition = "LONGTEXT")
    private String sectionScoresJson;

    @Lob
    @Column(name = "keyword_analysis_json", columnDefinition = "LONGTEXT")
    private String keywordAnalysisJson;

    @Lob
    @Column(name = "skill_gap_json", columnDefinition = "LONGTEXT")
    private String skillGapJson;

    @Lob
    @Column(name = "formatting_issues_json", columnDefinition = "LONGTEXT")
    private String formattingIssuesJson;

    @Lob
    @Column(name = "grammar_analysis_json", columnDefinition = "LONGTEXT")
    private String grammarAnalysisJson;

    @Lob
    @Column(name = "improvements_json", columnDefinition = "LONGTEXT")
    private String improvementsJson;

    @Lob
    @Column(name = "role_recommendations_json", columnDefinition = "LONGTEXT")
    private String roleRecommendationsJson;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
