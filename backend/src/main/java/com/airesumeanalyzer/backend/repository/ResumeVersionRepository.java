package com.airesumeanalyzer.backend.repository;

import com.airesumeanalyzer.backend.entity.ResumeVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, String> {
    List<ResumeVersion> findByResumeIdOrderByVersionNumberDesc(String resumeId);
    Optional<ResumeVersion> findFirstByResumeIdOrderByVersionNumberDesc(String resumeId);
    Optional<ResumeVersion> findByIdAndResumeUserId(String id, Long userId);
}
