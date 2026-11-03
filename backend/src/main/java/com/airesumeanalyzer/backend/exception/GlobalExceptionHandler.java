package com.airesumeanalyzer.backend.exception;

import com.airesumeanalyzer.backend.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException e) {
        log.warn("API Exception occurred [{}]: {}", e.getErrorCode(), e.getMessage());
        ApiResponse<Void> response = ApiResponse.error(e.getErrorCode(), e.getMessage());
        return new ResponseEntity<>(response, e.getStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException e) {
        log.warn("Validation exception: {}", e.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Validation failed")
                .data(errors)
                .errorCode("VALIDATION_ERROR")
                .build();
                
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxSizeException(MaxUploadSizeExceededException e) {
        log.warn("Max upload size exceeded: {}", e.getMessage());
        ApiResponse<Void> response = ApiResponse.error("FILE_TOO_LARGE", "File size exceeds limit of 5MB");
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException e) {
        log.warn("Access denied exception: {}", e.getMessage());
        ApiResponse<Void> response = ApiResponse.error("UNAUTHORIZED_ACCESS", "You do not have permission to access this resource.");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(org.springframework.web.multipart.MultipartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMultipartException(org.springframework.web.multipart.MultipartException e) {
        log.warn("Multipart request error: {}", e.getMessage());
        String msg = e.getMessage() != null ? e.getMessage() : "Invalid multipart file upload request.";
        ApiResponse<Void> response = ApiResponse.error("MULTIPART_ERROR", msg);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception e) {
        log.error("Unexpected exception occurred: {}", e.getMessage(), e);
        String msg = (e.getMessage() != null && !e.getMessage().isBlank()) ? e.getMessage() : "An unexpected error occurred.";
        ApiResponse<Void> response = ApiResponse.error("INTERNAL_SERVER_ERROR", msg);
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
