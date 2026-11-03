package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.tika.Tika;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
@Slf4j
public class DocumentParserServiceImpl implements DocumentParserService {

    private final Tika tika = new Tika();

    @Override
    public String extractText(byte[] fileBytes, String filename) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_FILE", "File is empty");
        }
        return extractText(new ByteArrayInputStream(fileBytes), filename);
    }

    @Override
    public String extractText(InputStream inputStream, String filename) {
        try {
            byte[] fileBytes = inputStream.readAllBytes();
            if (fileBytes.length == 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_FILE", "File is empty");
            }

            // Detect mime type using Tika
            String mimeType = tika.detect(fileBytes, filename);
            log.debug("Detected mime type for file '{}': {}", filename, mimeType);

            String lowerFilename = filename != null ? filename.toLowerCase() : "";
            boolean isPdf = "application/pdf".equalsIgnoreCase(mimeType)
                    || (mimeType != null && mimeType.contains("pdf"))
                    || lowerFilename.endsWith(".pdf")
                    || (fileBytes.length >= 4 && fileBytes[0] == 0x25 && fileBytes[1] == 0x50 && fileBytes[2] == 0x44 && fileBytes[3] == 0x46);

            boolean isDocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equalsIgnoreCase(mimeType) 
                    || "application/msword".equalsIgnoreCase(mimeType)
                    || (mimeType != null && (mimeType.contains("word") || mimeType.contains("officedocument")))
                    || lowerFilename.endsWith(".docx") || lowerFilename.endsWith(".doc");

            String extractedText;
            if (isPdf) {
                extractedText = parsePdf(fileBytes);
            } else if (isDocx) {
                extractedText = parseDocx(fileBytes);
            } else {
                throw new ApiException(HttpStatus.BAD_REQUEST, "UNSUPPORTED_FILE_TYPE", 
                        "Unsupported file format. Please upload a valid PDF or DOCX resume.");
            }

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "EMPTY_DOCUMENT", 
                        "Unable to extract text from this document. Please upload a valid PDF or DOCX resume.");
            }

            return extractedText;

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse document: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "RESUME_PARSE_ERROR", 
                    "Unable to extract text from this document. Please upload a valid PDF or DOCX resume.");
        }
    }

    private String parsePdf(byte[] fileBytes) throws IOException {
        log.debug("Parsing PDF file of size: {} bytes", fileBytes.length);
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            if (document.isEncrypted()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "ENCRYPTED_FILE", "The uploaded PDF is password protected.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String parseDocx(byte[] fileBytes) throws IOException {
        log.debug("Parsing DOCX file of size: {} bytes", fileBytes.length);
        try (ByteArrayInputStream bais = new ByteArrayInputStream(fileBytes);
             XWPFDocument document = new XWPFDocument(bais);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }
}
