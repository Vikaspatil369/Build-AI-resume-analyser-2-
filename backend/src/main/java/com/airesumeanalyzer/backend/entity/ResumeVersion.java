package com.airesumeanalyzer.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "resume_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeVersion {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(nullable = false)
    private String name;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Lob
    @Column(name = "parsed_json_content", columnDefinition = "LONGTEXT")
    private String parsedJsonContent;

    @Lob
    @Column(name = "raw_text_content", columnDefinition = "LONGTEXT")
    private String rawTextContent;

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
