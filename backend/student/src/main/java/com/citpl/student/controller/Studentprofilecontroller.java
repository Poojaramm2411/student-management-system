package com.citpl.student.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import com.citpl.student.model.Assignment;
import com.citpl.student.model.AssignmentSubmission;
import com.citpl.student.model.AssignmentStatus;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Enrollment;
import com.citpl.student.model.Student;
import com.citpl.student.repository.AssignmentRepository;
import com.citpl.student.repository.AssignmentSubmissionRepository;
import com.citpl.student.repository.EnrollmentRepository;
import com.citpl.student.repository.StudentRepository;
import com.citpl.student.dto.Request.SubmissionRequestDTO;
import com.citpl.student.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student")
@CrossOrigin("*")
@RequiredArgsConstructor
public class Studentprofilecontroller {

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SubmissionService submissionService;

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

    // GET /api/student/me/assignments — all PUBLISHED assignments for the
    // logged-in student's batch, merged with their own submission status
    // (if they've submitted/been graded already). Same identity pattern:
    // derived from the JWT, never a path param.
    @GetMapping("/me/assignments")
    public ResponseEntity<?> getMyAssignments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Batch batch = student.getBatch();
        if (batch == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Assignment> assignments = assignmentRepository
            .searchAssignments(null, AssignmentStatus.PUBLISHED, batch.getId(), null,
                org.springframework.data.domain.Pageable.unpaged())
            .getContent();

        List<Map<String, Object>> response = assignments.stream()
            .map(a -> {
                Optional<AssignmentSubmission> submission =
                    submissionRepository.findByAssignmentIdAndStudentId(a.getId(), student.getId());

                Map<String, Object> m = new HashMap<>();
                m.put("assignmentId", a.getId());
                m.put("title", a.getTitle());
                m.put("description", a.getDescription());
                m.put("dueDate", a.getDueDate() != null ? a.getDueDate().toString() : null);
                m.put("maxMarks", a.getMaxMarks());
                m.put("attachmentUrl", a.getAttachmentUrl());
                m.put("submissionType", a.getSubmissionType().name());

                if (submission.isPresent()) {
                    AssignmentSubmission s = submission.get();
                    m.put("submissionId", s.getId());
                    m.put("status", s.getStatus().name());
                    m.put("submittedAt", s.getSubmittedAt() != null ? s.getSubmittedAt().toString() : null);
                    m.put("content", s.getContent());
                    m.put("fileUrl", s.getFileUrl());
                    m.put("linkUrl", s.getLinkUrl());
                    m.put("marksObtained", s.getMarksObtained());
                    m.put("feedback", s.getFeedback());
                } else {
                    m.put("submissionId", null);
                    m.put("status", "PENDING");
                    m.put("submittedAt", null);
                    m.put("content", null);
                    m.put("fileUrl", null);
                    m.put("linkUrl", null);
                    m.put("marksObtained", null);
                    m.put("feedback", null);
                }
                return m;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // POST /api/student/me/assignments/{assignmentId}/submit — the logged-in
    // student submits (or resubmits) their work. studentId is NEVER taken
    // from the request body — it's forced from the JWT identity here, so a
    // student can never submit on behalf of someone else.
    @PostMapping("/me/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitMyAssignment(@PathVariable Long assignmentId,
                                                 @RequestBody SubmissionRequestDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        dto.setStudentId(student.getId());

        return ResponseEntity.ok(submissionService.submit(assignmentId, dto));
    }
}