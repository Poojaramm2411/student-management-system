package com.citpl.student.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import com.citpl.student.model.Assignment;
import com.citpl.student.model.AssignmentStatus;
import com.citpl.student.model.AssignmentSubmission;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Enrollment;
import com.citpl.student.model.QuestionBank;
import com.citpl.student.model.Student;
import com.citpl.student.model.SubmissionStatus;
import com.citpl.student.dto.Request.SubmissionRequestDTO;
import com.citpl.student.repository.AssignmentRepository;
import com.citpl.student.repository.AssignmentSubmissionRepository;
import com.citpl.student.repository.EnrollmentRepository;
import com.citpl.student.repository.QuestionBankRepository;
import com.citpl.student.repository.StudentRepository;
import com.citpl.student.service.EmailService;
import com.citpl.student.service.SubmissionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class Studentprofilecontroller {

    private final StudentRepository studentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SubmissionService submissionService;
    private final EmailService emailService;
    private final QuestionBankRepository questionBankRepository;

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

                List<QuestionBank> allQ = questionBankRepository.findByAssignmentId(a.getId());
                m.put("isMcqTest", !allQ.isEmpty());

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
                    m.put("assignedSet", s.getAssignedSet());
                    m.put("triedSets", s.getTriedSets());

                    if (s.getAssignedSet() != null) {
                        List<QuestionBank> qList = questionBankRepository
                            .findByAssignmentIdAndQuestionSet(a.getId(), s.getAssignedSet());

                        ObjectMapper mapper = new ObjectMapper();
                        List<Map<String, Object>> decryptedQuestions = qList.stream()
                            .map(q -> {
                                try {
                                    String decryptedStr = com.citpl.student.util.AesUtil.decrypt(q.getEncryptedQuestion());
                                    Map<String, Object> qMap = mapper.readValue(decryptedStr, Map.class);
                                    qMap.put("id", q.getId());
                                    qMap.put("questionSet", q.getQuestionSet());
                                    qMap.put("questionOrder", q.getQuestionOrder());
                                    return qMap;
                                } catch (Exception e) {
                                    System.err.println("Decryption failed: " + e.getMessage());
                                    return null;
                                }
                            })
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());

                        m.put("questions", decryptedQuestions);
                    } else {
                        m.put("questions", List.of());
                    }
                } else {
                    m.put("submissionId", null);
                    m.put("status", "PENDING");
                    m.put("submittedAt", null);
                    m.put("content", null);
                    m.put("fileUrl", null);
                    m.put("linkUrl", null);
                    m.put("marksObtained", null);
                    m.put("feedback", null);
                    m.put("assignedSet", null);
                    m.put("triedSets", null);
                    m.put("questions", List.of());
                }
                return m;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

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
