package com.airesumeanalyzer.backend;

import com.airesumeanalyzer.backend.dto.DashboardResponse;
import com.airesumeanalyzer.backend.dto.ResumeAnalysisResponse;
import com.airesumeanalyzer.backend.entity.*;
import com.airesumeanalyzer.backend.exception.ApiException;
import com.airesumeanalyzer.backend.repository.ResumeAnalysisRepository;
import com.airesumeanalyzer.backend.repository.ResumeRepository;
import com.airesumeanalyzer.backend.repository.UserRepository;
import com.airesumeanalyzer.backend.security.UserDetailsImpl;
import com.airesumeanalyzer.backend.service.AnalysisService;
import com.airesumeanalyzer.backend.service.DashboardServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResumeRepository resumeRepository;

    @Mock
    private ResumeAnalysisRepository resumeAnalysisRepository;

    @Mock
    private AnalysisService analysisService;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("john@example.com")
                .passwordHash("hashed")
                .role(Role.USER)
                .build();

        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L, "john@example.com", "hashed",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetDashboardSummary_EmptyUserData() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(resumeRepository.countByUserId(1L)).thenReturn(0L);
        when(resumeAnalysisRepository.getAverageAtsScoreByUserId(1L, AnalysisStatus.COMPLETED)).thenReturn(null);
        when(resumeAnalysisRepository.getMaxAtsScoreByUserId(1L, AnalysisStatus.COMPLETED)).thenReturn(null);
        when(resumeAnalysisRepository.getAverageJobMatchScoreByUserId(1L, AnalysisStatus.COMPLETED)).thenReturn(null);
        when(resumeAnalysisRepository.findRecentAnalysesByUserId(1L)).thenReturn(Collections.emptyList());

        DashboardResponse summary = dashboardService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(0L, summary.getTotalResumes());
        assertEquals(0.0, summary.getAverageAtsScore());
        assertEquals(0, summary.getBestAtsScore());
        assertEquals(0.0, summary.getAverageJobMatch());
        assertTrue(summary.getRecentAnalyses().isEmpty());
    }

    @Test
    void testGetDashboardSummary_WithResumesAndAnalyses() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(resumeRepository.countByUserId(1L)).thenReturn(3L);
        when(resumeAnalysisRepository.getAverageAtsScoreByUserId(1L, AnalysisStatus.COMPLETED)).thenReturn(84.66666);
        when(resumeAnalysisRepository.getMaxAtsScoreByUserId(1L, AnalysisStatus.COMPLETED)).thenReturn(95);
        when(resumeAnalysisRepository.getAverageJobMatchScoreByUserId(1L, AnalysisStatus.COMPLETED)).thenReturn(78.5);

        ResumeAnalysis mockAnalysis = ResumeAnalysis.builder()
                .id("analysis-uuid-1")
                .status(AnalysisStatus.COMPLETED)
                .atsScore(95)
                .jobMatchScore(85)
                .createdAt(LocalDateTime.now())
                .build();

        ResumeAnalysisResponse mockResponse = ResumeAnalysisResponse.builder()
                .id("analysis-uuid-1")
                .resumeName("My_Resume.pdf")
                .atsScore(95)
                .jobMatchScore(85)
                .status("COMPLETED")
                .build();

        when(resumeAnalysisRepository.findRecentAnalysesByUserId(1L)).thenReturn(List.of(mockAnalysis));
        when(analysisService.mapToResponse(mockAnalysis)).thenReturn(mockResponse);

        DashboardResponse summary = dashboardService.getDashboardSummary();

        assertNotNull(summary);
        assertEquals(3L, summary.getTotalResumes());
        assertEquals(84.7, summary.getAverageAtsScore(), "Should round to 1 decimal place");
        assertEquals(95, summary.getBestAtsScore());
        assertEquals(78.5, summary.getAverageJobMatch());
        assertEquals(1, summary.getRecentAnalyses().size());
        assertEquals("My_Resume.pdf", summary.getRecentAnalyses().get(0).getResumeName());
        verify(analysisService, times(1)).mapToResponse(mockAnalysis);
    }

    @Test
    void testGetDashboardSummary_Unauthenticated() {
        SecurityContextHolder.clearContext();

        assertThrows(ApiException.class, () -> dashboardService.getDashboardSummary());
    }
}
