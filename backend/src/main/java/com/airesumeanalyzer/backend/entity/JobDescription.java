package com.airesumeanalyzer.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_descriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescription {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    private String company;

    @Lob
    @Column(name = "raw_text", nullable = false, columnDefinition = "LONGTEXT")
    private String rawText;

    @Lob
    @Column(name = "parsed_json_keywords", columnDefinition = "LONGTEXT")
    private String parsedJsonKeywords;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
