package com.airesumeanalyzer.backend;

import com.airesumeanalyzer.backend.exception.ApiException;
import com.airesumeanalyzer.backend.service.DocumentParserServiceImpl;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class DocumentParserServiceImplTest {

    private DocumentParserServiceImpl parserService;

    @BeforeEach
    void setUp() {
        parserService = new DocumentParserServiceImpl();
    }

    @Test
    void testExtractTextFromPdf() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            try (PDPageContentStream stream = new PDPageContentStream(doc, page)) {
                stream.beginText();
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                stream.newLineAtOffset(100, 700);
                stream.showText("Jane Doe - Experienced Full Stack Developer");
                stream.endText();
            }
            doc.save(baos);
        }

        String extracted = parserService.extractText(baos.toByteArray(), "resume.pdf");
        assertNotNull(extracted);
        assertTrue(extracted.contains("Jane Doe"));
        assertTrue(extracted.contains("Experienced Full Stack Developer"));
    }

    @Test
    void testEmptyFileThrowsException() {
        assertThrows(ApiException.class, () -> {
            parserService.extractText(new byte[0], "empty.pdf");
        });
    }

    @Test
    void testUnsupportedFormatThrowsException() {
        assertThrows(ApiException.class, () -> {
            parserService.extractText("Some random non-binary text content".getBytes(), "resume.txt");
        });
    }
}
