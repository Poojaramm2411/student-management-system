package com.citpl.student.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ValidationException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Converts backend exceptions into a clean, predictable JSON body:
 *   { "message": "...", "status": 404, "timestamp": "..." }
 *
 * The frontend (enrollmentSlice.jsx and friends) reads
 * err.response?.data?.message — without this handler, exceptions like
 * "Student not found" thrown from EnrollmentService bubble up as raw
 * Spring Boot 500 error pages instead of a usable message, so every
 * toast just says "Failed to create enrollment" with no detail.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(Validationexception.class)
    public ResponseEntity<Object> handleValidation(Validationexception ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // Fallback for any other unexpected RuntimeException so the frontend
    // still gets a proper JSON message instead of an HTML error page.
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntime(RuntimeException ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage() != null ? ex.getMessage() : "Something went wrong");
    }

    private ResponseEntity<Object> buildResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("status", status.value());
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}