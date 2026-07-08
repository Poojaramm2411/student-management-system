package com.citpl.student.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Enrollment;
import com.citpl.student.model.Student;
import com.citpl.student.repository.EnrollmentRepository;
import com.citpl.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@CrossOrigin("*")
@RequiredArgsConstructor
public class Studentprofilecontroller {

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;

    // GET /api/student/me — returns the logged-in Student's own profile.
    // Identity comes from the JWT (set by JwtAuthFilter as the auth "name"),
    // NOT from a path parameter, so a student can never fetch someone else's data.
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Batch batch = student.getBatch();

        Map<String, Object> response = new HashMap<>();
        response.put("id", student.getId());
        response.put("name", student.getName());
        response.put("email", student.getEmail());
        response.put("age", student.getAge());
        response.put("studentCode", student.getStudentCode());
        response.put("city", student.getCity());
        response.put("status", student.getStatus().name());
        response.put("batchName", batch != null ? batch.getBatchName() : null);
        response.put("batchCode", batch != null ? batch.getBatchCode() : null);
        response.put("courseName", (batch != null && batch.getCourse() != null) ? batch.getCourse().getCourseName() : null);

        return ResponseEntity.ok(response);
    }

    // GET /api/student/me/fees — all of the logged-in Student's enrollments
    // and their fee breakdown (Paid / Pending / Partial). Same identity
    // pattern as getMyProfile(): derived from the JWT, never a path param.
    @GetMapping("/me/fees")
    public ResponseEntity<?> getMyFees() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());

        List<Map<String, Object>> response = enrollments.stream()
            .map(e -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", e.getId());
                m.put("courseName", e.getCourseName());
                m.put("batchName", e.getBatchName());
                m.put("baseFee", e.getBaseFee());
                m.put("gstAmount", e.getGstAmount());
                m.put("totalFee", e.getTotalFee());
                m.put("paidAmount", e.getPaidAmount());
                m.put("balanceDue", e.getTotalFee() != null ? e.getTotalFee() - (e.getPaidAmount() != null ? e.getPaidAmount() : 0) : null);
                m.put("feeStatus", e.getFeeStatus());
                m.put("paymentMode", e.getPaymentMode());
                m.put("enrolledDate", e.getEnrolledDate() != null ? e.getEnrolledDate().toString() : null);
                return m;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}