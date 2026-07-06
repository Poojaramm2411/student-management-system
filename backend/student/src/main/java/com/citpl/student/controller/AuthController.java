package com.citpl.student.controller;

import com.citpl.student.dto.Request.LoginRequest;
import com.citpl.student.dto.Request.SelfRegisterRequest;
import com.citpl.student.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/login — shared login for Admin, Student, Instructor.
    // Role is auto-detected server-side by which table the email belongs to.
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", e.getMessage()));
        }
    }

    // POST /api/auth/register/student — claims an existing Student record
    // (added by Admin) by setting its password for the first time.
    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@RequestBody SelfRegisterRequest request) {
        try {
            String message = authService.registerStudent(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // POST /api/auth/register/instructor — same pattern for Instructor.
    @PostMapping("/register/instructor")
    public ResponseEntity<?> registerInstructor(@RequestBody SelfRegisterRequest request) {
        try {
            String message = authService.registerInstructor(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}