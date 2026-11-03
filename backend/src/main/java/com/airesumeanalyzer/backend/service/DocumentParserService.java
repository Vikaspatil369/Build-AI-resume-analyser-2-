package com.airesumeanalyzer.backend.service;

import java.io.InputStream;

public interface DocumentParserService {
    String extractText(byte[] fileBytes, String filename);
    String extractText(InputStream inputStream, String filename);
}
