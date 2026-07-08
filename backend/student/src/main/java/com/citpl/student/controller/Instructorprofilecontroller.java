package com.citpl.student.controller;

import com.citpl.student.dto.Response.InstructorProfileresponse;
import com.citpl.student.model.Instructor;
import com.citpl.student.repository.InstructorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instructor")
@CrossOrigin("*")
@RequiredArgsConstructor
public class Instructorprofilecontroller {

    private final InstructorRepository instructorRepository;

    // GET /api/instructor/me — same pattern as StudentProfileController:
    // identity comes from the JWT, not a path parameter.
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // InstructorRepository does not define findByEmail; fall back to scanning all instructors.
        Instructor instructor = instructorRepository.findAll()
            .stream()
            .filter(i -> email.equals(i.getEmail()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Instructor profile not found"));

        InstructorProfileresponse response = new InstructorProfileresponse(
            instructor.getId(),
            instructor.getName(),
            instructor.getEmail(),
            instructor.getPhone(),
            instructor.getSpecialization(),
            instructor.getStatus().name()
        );

        return ResponseEntity.ok(response);
    }
}