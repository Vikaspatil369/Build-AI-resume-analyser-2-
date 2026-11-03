package com.airesumeanalyzer.backend.repository;

import com.airesumeanalyzer.backend.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, String> {
    List<JobDescription> findByUserId(Long userId);
    Optional<JobDescription> findByIdAndUserId(String id, Long userId);
}
