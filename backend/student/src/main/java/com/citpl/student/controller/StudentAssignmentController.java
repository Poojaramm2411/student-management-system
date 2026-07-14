package com.citpl.student.controller;

import com.citpl.student.model.*;
import com.citpl.student.repository.*;
import com.citpl.student.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student-assignment")
@CrossOrigin("*")
@RequiredArgsConstructor
public class StudentAssignmentController {

    private final StudentRepository studentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final QuestionBankRepository questionBankRepository;
    private final EmailService emailService;

    @GetMapping("/start")
    public ResponseEntity<?> startAssignment(@RequestParam Long assignmentId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        Optional<AssignmentSubmission> existingSub = submissionRepository
            .findByAssignmentIdAndStudentId(assignmentId, student.getId());

        AssignmentSubmission submission;
        if (existingSub.isPresent()) {
            submission = existingSub.get();
            if (submission.getStatus() != SubmissionStatus.IN_PROGRESS && submission.getStatus() != SubmissionStatus.PENDING) {
                return ResponseEntity.badRequest().body(Map.of("message", "Assignment has already been submitted"));
            }
        } else {
            java.util.Random random = new java.util.Random();
            int randomSet = random.nextInt(4) + 1; // 1 to 4
            submission = AssignmentSubmission.builder()
                .assignment(assignment)
                .student(student)
                .status(SubmissionStatus.IN_PROGRESS)
                .assignedSet(randomSet)
                .triedSets(String.valueOf(randomSet))
                .build();
            submission = submissionRepository.save(submission);

            try {
                if (assignment.getInstructor() != null && assignment.getInstructor().getEmail() != null) {
                    String subject = "Student starting assignment: " + assignment.getTitle();
                    String body = String.format("Dear Instructor,\n\nStudent %s (%s) has started taking the assignment: %s.\n\nBest regards,\nStudent Management System",
                        student.getName(), student.getStudentCode(), assignment.getTitle());
                    emailService.sendNotification(assignment.getInstructor().getEmail(), subject, body);
                }
            } catch (Exception e) {
                System.err.println("Failed to send notification email: " + e.getMessage());
            }
        }

        // Decrypt and load only the assigned set's questions
        List<QuestionBank> qList = questionBankRepository
            .findByAssignmentIdAndQuestionSet(assignmentId, submission.getAssignedSet());

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

        return ResponseEntity.ok(Map.of(
            "submissionId", submission.getId(),
            "status", submission.getStatus().name(),
            "assignedSet", submission.getAssignedSet(),
            "triedSets", submission.getTriedSets(),
            "questions", decryptedQuestions
        ));
    }

    @PostMapping("/save-draft")
    public ResponseEntity<?> saveDraft(@RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());
        String content = (String) payload.get("content");

        AssignmentSubmission submission = submissionRepository
            .findByAssignmentIdAndStudentId(assignmentId, student.getId())
            .orElseThrow(() -> new RuntimeException("No active test session found"));

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot save draft. Test is not in progress."));
        }

        submission.setContent(content);
        submissionRepository.save(submission);

        return ResponseEntity.ok(Map.of("message", "Draft saved successfully"));
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitTest(@RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());
        String content = (String) payload.get("content");

        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        AssignmentSubmission submission = submissionRepository
            .findByAssignmentIdAndStudentId(assignmentId, student.getId())
            .orElseThrow(() -> new RuntimeException("No active test session found"));

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot submit. Test is not in progress."));
        }

        submission.setContent(content);
        submission.setSubmittedAt(java.time.LocalDateTime.now());
        
        boolean isLate = assignment.getDueDate() != null && java.time.LocalDate.now().isAfter(assignment.getDueDate());
        submission.setStatus(isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED);
        submissionRepository.save(submission);

        return ResponseEntity.ok(Map.of(
            "message", "Test submitted successfully",
            "status", submission.getStatus().name()
        ));
    }

    @PostMapping("/new-set")
    public ResponseEntity<?> requestNewSet(@RequestBody Map<String, Object> payload) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Long assignmentId = Long.valueOf(payload.get("assignmentId").toString());

        AssignmentSubmission submission = submissionRepository
            .findByAssignmentIdAndStudentId(assignmentId, student.getId())
            .orElseThrow(() -> new RuntimeException("No active test session found"));

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot change question set. Test is not in progress."));
        }

        String triedStr = submission.getTriedSets();
        java.util.Set<Integer> tried = new java.util.HashSet<>();
        if (triedStr != null && !triedStr.isBlank()) {
            for (String s : triedStr.split(",")) {
                try {
                    tried.add(Integer.parseInt(s.trim()));
                } catch (NumberFormatException ignored) {}
            }
        }

        java.util.List<Integer> available = new java.util.ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            if (!tried.contains(i)) {
                available.add(i);
            }
        }

        if (available.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "You have already tried all 4 question sets!"));
        }

        java.util.Random random = new java.util.Random();
        int nextSet = available.get(random.nextInt(available.size()));
        tried.add(nextSet);

        String newTriedStr = tried.stream()
            .map(String::valueOf)
            .collect(java.util.stream.Collectors.joining(","));

        submission.setAssignedSet(nextSet);
        submission.setTriedSets(newTriedStr);
        submission.setContent(null);
        submissionRepository.save(submission);

        // Decrypt and load only the new assigned set's questions
        List<QuestionBank> qList = questionBankRepository
            .findByAssignmentIdAndQuestionSet(assignmentId, nextSet);

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

        return ResponseEntity.ok(Map.of(
            "assignedSet", nextSet,
            "triedSets", newTriedStr,
            "message", "New set assigned. Draft cleared.",
            "questions", decryptedQuestions
        ));
    }
}
