package com.citpl.student.controller;

import com.citpl.student.dto.Response.LoginactivityResponse;
import com.citpl.student.model.Instructor;
import com.citpl.student.model.Student;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

// Mapped under /api/admin/** so it's automatically covered by the existing
// SecurityConfig rule: requestMatchers("/api/admin/**").hasRole("ADMIN")
// No security config changes needed.
@RestController
@RequestMapping("/api/admin/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;

    // GET /api/admin/activity/recent-logins?limit=10
    // Returns the most recent student + instructor logins, newest first.
    // Accounts that have never logged in (lastLoginAt == null) are excluded.
    @GetMapping("/recent-logins")
    public ResponseEntity<List<LoginactivityResponse>> recentLogins(
            @RequestParam(defaultValue = "10") int limit) {

        List<LoginactivityResponse> activity = new ArrayList<>();

        for (Student s : studentRepository.findAll()) {
            if (s.getLastLoginAt() != null) {
                activity.add(new LoginactivityResponse(
                        s.getName(), s.getEmail(), "STUDENT", s.getLastLoginAt()));
            }
        }

        for (Instructor i : instructorRepository.findAll()) {
            if (i.getLastLoginAt() != null) {
                activity.add(new LoginactivityResponse(
                        i.getName(), i.getEmail(), "INSTRUCTOR", i.getLastLoginAt()));
            }
        }

        activity.sort(Comparator.comparing(LoginactivityResponse::getLastLoginAt).reversed());

        return ResponseEntity.ok(
                activity.size() > limit ? activity.subList(0, limit) : activity
        );
    }
}