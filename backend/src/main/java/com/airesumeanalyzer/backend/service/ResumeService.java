package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.ResumeResponse;
import com.airesumeanalyzer.backend.dto.ResumeVersionResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {
    ResumeResponse uploadResume(MultipartFile file);
    List<ResumeResponse> listAllResumes();
    ResumeResponse getResume(String id);
    void deleteResume(String id);
    ResumeVersionResponse getVersion(String versionId);
    ResumeResponse renameResume(String id, String newName);
    ResumeVersionResponse duplicateVersion(String versionId, String newName);
}
