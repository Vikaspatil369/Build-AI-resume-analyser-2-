package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.AdminStatsResponse;
import com.airesumeanalyzer.backend.dto.ResumeAnalysisResponse;
import com.airesumeanalyzer.backend.repository.ResumeAnalysisRepository;
import com.airesumeanalyzer.backend.repository.ResumeRepository;
import com.airesumeanalyzer.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final AnalysisService analysisService;

    @Value("${app.ai.provider}")
    private String aiProvider;

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getSystemStatistics() {
        log.info("Generating system administration statistics");

        long totalUsers = userRepository.count();
        long totalResumes = resumeRepository.count();
        long totalAnalyses = resumeAnalysisRepository.count();

        // Get recent 10 analyses system-wide
        List<ResumeAnalysisResponse> recentSystemAnalyses = resumeAnalysisRepository.findAll(
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream()
                .map(analysisService::mapToResponse)
                .collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalResumes(totalResumes)
                .totalAnalyses(totalAnalyses)
                .aiProvider(aiProvider)
                .recentSystemAnalyses(recentSystemAnalyses)
                .build();
    }
}
