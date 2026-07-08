package com.citpl.student.controller;

import com.citpl.student.dto.Request.GradeSubmissionRequestDTO;
import com.citpl.student.dto.Request.SubmissionRequestDTO;
import com.citpl.student.dto.Response.SubmissionResponseDTO;
import com.citpl.student.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // Student submits (or resubmits) their work for an assignment
    @PostMapping("/api/assignments/{assignmentId}/submissions")
    public ResponseEntity<Object> submit(@PathVariable Long assignmentId, @RequestBody SubmissionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(submissionService.submit(assignmentId, dto));
    }

    // Instructor views all submissions for one assignment
    @GetMapping("/api/assignments/{assignmentId}/submissions")
    public ResponseEntity<Page<SubmissionResponseDTO>> getSubmissionsForAssignment(
            @PathVariable Long assignmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(submissionService.getSubmissionsForAssignment(assignmentId, pageable));
    }

    // Student views all their own submissions across assignments
    @GetMapping("/api/students/{studentId}/submissions")
    public ResponseEntity<Page<SubmissionResponseDTO>> getSubmissionsForStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(submissionService.getSubmissionsForStudent(studentId, pageable));
    }

    @GetMapping("/api/submissions/{id}")
    public ResponseEntity<Object> getSubmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getSubmissionById(id));
    }

    // Instructor grades a submission
    @PutMapping("/api/submissions/{id}/grade")
    public ResponseEntity<Object> grade(@PathVariable Long id, @RequestBody GradeSubmissionRequestDTO dto) {
        return ResponseEntity.ok(submissionService.grade(id, dto));
    }
}