package com.airesumeanalyzer.backend.repository;

import com.airesumeanalyzer.backend.entity.AnalysisStatus;
import com.airesumeanalyzer.backend.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, String> {
    
    List<ResumeAnalysis> findByResumeVersionResumeUserId(Long userId);
    
    Optional<ResumeAnalysis> findByIdAndResumeVersionResumeUserId(String id, Long userId);
    
    List<ResumeAnalysis> findByResumeVersionResumeId(String resumeId);
    
    long countByResumeVersionResumeUserId(Long userId);
    
    @Query("SELECT ra FROM ResumeAnalysis ra WHERE ra.resumeVersion.resume.user.id = :userId ORDER BY ra.createdAt DESC")
    List<ResumeAnalysis> findRecentAnalysesByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(ra.atsScore) FROM ResumeAnalysis ra WHERE ra.resumeVersion.resume.user.id = :userId AND ra.status = :status")
    Double getAverageAtsScoreByUserId(@Param("userId") Long userId, @Param("status") AnalysisStatus status);

    @Query("SELECT MAX(ra.atsScore) FROM ResumeAnalysis ra WHERE ra.resumeVersion.resume.user.id = :userId AND ra.status = :status")
    Integer getMaxAtsScoreByUserId(@Param("userId") Long userId, @Param("status") AnalysisStatus status);

    @Query("SELECT AVG(ra.jobMatchScore) FROM ResumeAnalysis ra WHERE ra.resumeVersion.resume.user.id = :userId AND ra.status = :status AND ra.jobMatchScore IS NOT NULL")
    Double getAverageJobMatchScoreByUserId(@Param("userId") Long userId, @Param("status") AnalysisStatus status);
}
