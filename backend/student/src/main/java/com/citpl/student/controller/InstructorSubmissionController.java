package com.citpl.student.controller;

import com.citpl.student.dto.Request.GradeSubmissionRequestDTO;
import com.citpl.student.dto.Response.AssignmentResponseDTO;
import com.citpl.student.dto.Response.SubmissionResponseDTO;
import com.citpl.student.dto.Request.AssignmentRequestDTO;
import com.citpl.student.model.Instructor;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.service.AssignmentService;
import com.citpl.student.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Instructor-scoped submission viewing + grading. Reuses the existing
 * SubmissionService (same one SubmissionController uses) - this controller's only
 * job is ownership enforcement: an instructor can only see/grade submissions for
 * assignments THEY created.
 *
 * Ownership check works by fetching the submission's assignmentId, then looking that
 * assignment up via the existing AssignmentService (which already exposes
 * getInstructorId()) and comparing against the logged-in instructor.
 *
 * NOTE: the underlying /api/assignments/{id}/submissions and /api/submissions/{id}/grade
 * endpoints in SubmissionController are NOT role-restricted in SecurityConfig (they fall
 * under .anyRequest().authenticated()) - meaning a student could currently call those
 * directly. This new controller doesn't fix that pre-existing gap, it just gives
 * instructors a properly-scoped path. Worth tightening SecurityConfig separately later
 * with something like .requestMatchers("/api/submissions/**").hasAnyRole("ADMIN","INSTRUCTOR").
 */
@RestController
@RequestMapping("/api/instructor/submissions")
@CrossOrigin("*")
@RequiredArgsConstructor
public class InstructorSubmissionController {

    private final InstructorRepository instructorRepository;
    private final SubmissionService submissionService;
    private final AssignmentService<AssignmentResponseDTO, AssignmentRequestDTO> assignmentService;

    private Instructor currentInstructor() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return instructorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor profile not found"));
    }

    /** Throws/returns false if the assignment isn't owned by this instructor. */
    private boolean ownsAssignment(Long assignmentId, Long instructorId) {
        AssignmentResponseDTO assignment = assignmentService.getAssignmentById(assignmentId);
        return assignment.getInstructorId() != null && assignment.getInstructorId().equals(instructorId);
    }

    // GET /api/instructor/submissions?assignmentId=X - all submissions for one of
    // their own assignments (student answers + question sets already covered by
    // GET /api/instructor/assignments/{id} - this is specifically the grading queue).
    @GetMapping
    public ResponseEntity<Object> getSubmissionsForAssignment(
            @RequestParam Long assignmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Instructor instructor = currentInstructor();

        if (!ownsAssignment(assignmentId, instructor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only view submissions for assignments you created");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<SubmissionResponseDTO> result = submissionService.getSubmissionsForAssignment(assignmentId, pageable);
        return ResponseEntity.ok(result);
    }

    // GET /api/instructor/submissions/{id} - view one submission in detail
    @GetMapping("/{id}")
    public ResponseEntity<Object> getSubmissionById(@PathVariable Long id) {
        Instructor instructor = currentInstructor();

        SubmissionResponseDTO submission = submissionService.getSubmissionById(id);

        if (!ownsAssignment(submission.getAssignmentId(), instructor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only view submissions for assignments you created");
        }

        return ResponseEntity.ok(submission);
    }

    // PUT /api/instructor/submissions/{id}/grade - set marks + feedback,
    // only for submissions belonging to assignments this instructor created.
    @PutMapping("/{id}/grade")
    public ResponseEntity<Object> grade(@PathVariable Long id, @RequestBody GradeSubmissionRequestDTO dto) {
        Instructor instructor = currentInstructor();

        SubmissionResponseDTO submission = submissionService.getSubmissionById(id);

        if (!ownsAssignment(submission.getAssignmentId(), instructor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only grade submissions for assignments you created");
        }

        // Force server-side, ignore whatever instructorId (if any) came in the request body
        dto.setInstructorId(instructor.getId());

        return ResponseEntity.ok(submissionService.grade(id, dto));
    }
}