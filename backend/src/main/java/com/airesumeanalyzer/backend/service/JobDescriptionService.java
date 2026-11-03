package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.JobDescriptionRequest;
import com.airesumeanalyzer.backend.dto.JobDescriptionResponse;

import java.util.List;

public interface JobDescriptionService {
    JobDescriptionResponse createJobDescription(JobDescriptionRequest request);
    List<JobDescriptionResponse> listAllJobDescriptions();
    JobDescriptionResponse getJobDescription(String id);
    void deleteJobDescription(String id);
}
