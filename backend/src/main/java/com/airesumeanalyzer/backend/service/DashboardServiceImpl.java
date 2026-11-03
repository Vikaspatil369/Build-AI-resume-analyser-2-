package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.DashboardResponse;
import com.airesumeanalyzer.backend.dto.ResumeAnalysisResponse;
import com.airesumeanalyzer.backend.entity.AnalysisStatus;
import com.airesumeanalyzer.backend.entity.User;
import com.airesumeanalyzer.backend.exception.ApiException;
import com.airesumeanalyzer.backend.repository.ResumeAnalysisRepository;
import com.airesumeanalyzer.backend.repository.ResumeRepository;
import com.airesumeanalyzer.backend.repository.UserRepository;
import com.airesumeanalyzer.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final AnalysisService analysisService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User is not authenticated");
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "User not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardSummary() {
        User user = getCurrentUser();
        log.info("Generating dashboard summary for user: {}", user.getEmail());

        long totalResumes = resumeRepository.countByUserId(user.getId());
        
        Double avgAts = resumeAnalysisRepository.getAverageAtsScoreByUserId(user.getId(), AnalysisStatus.COMPLETED);
        Integer maxAts = resumeAnalysisRepository.getMaxAtsScoreByUserId(user.getId(), AnalysisStatus.COMPLETED);
        Double avgMatch = resumeAnalysisRepository.getAverageJobMatchScoreByUserId(user.getId(), AnalysisStatus.COMPLETED);

        List<ResumeAnalysisResponse> recentAnalyses = resumeAnalysisRepository.findRecentAnalysesByUserId(user.getId())
                .stream()
                .limit(5)
                .map(analysisService::mapToResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalResumes(totalResumes)
                .averageAtsScore(avgAts == null ? 0.0 : Math.round(avgAts * 10.0) / 10.0)
                .bestAtsScore(maxAts == null ? 0 : maxAts)
                .averageJobMatch(avgMatch == null ? 0.0 : Math.round(avgMatch * 10.0) / 10.0)
                .recentAnalyses(recentAnalyses)
                .build();
    }
}
