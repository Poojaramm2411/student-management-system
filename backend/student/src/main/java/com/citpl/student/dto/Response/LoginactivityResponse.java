package com.citpl.student.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class LoginactivityResponse {
    private String name;
    private String email;
    private String role;          // "STUDENT" or "INSTRUCTOR"
    private LocalDateTime lastLoginAt;
}