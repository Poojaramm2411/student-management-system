package com.citpl.student.controller;

import com.citpl.student.dto.Request.AssignmentRequestDTO;
import com.citpl.student.dto.Response.AssignmentResponseDTO;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Instructor;
import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Instructor-scoped assignment endpoints. Reuses the existing AssignmentService
 * (same one AssignmentController uses for admin) so there's no duplicated business
 * logic - this controller's only job is to:
 *   1. Resolve WHO the logged-in instructor is, from the JWT (same proven pattern
 *      as Studentprofilecontroller's getMyProfile()).
 *   2. Force instructorId onto the DTO server-side, so an instructor can never
 *      create an assignment under someone else's name via a tampered request body.
 *   3. Verify the target batch actually belongs to them before allowing it.
 */
@RestController
@RequestMapping("/api/instructor/assignments")
@RequiredArgsConstructor
public class InstructorAssignmentController {

    private final InstructorRepository instructorRepository;
    private final BatchRepository batchRepository;
    private final AssignmentService<AssignmentResponseDTO, AssignmentRequestDTO> assignmentService;

    private Instructor currentInstructor() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return instructorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor profile not found"));
    }

    // GET /api/instructor/assignments/batches - batches THIS instructor teaches,
    // for populating the "Batch" dropdown on the Add Assignment form.
    @GetMapping("/batches")
    public ResponseEntity<Object> getMyBatches() {
        Instructor instructor = currentInstructor();

        List<Map<String, Object>> batches = batchRepository.findAll().stream()
                .filter(b -> b.getInstructor() != null && b.getInstructor().getId().equals(instructor.getId()))
                .map(b -> Map.<String, Object>of(
                        "id", b.getId(),
                        "batchName", b.getBatchName(),
                        "batchCode", b.getBatchCode()
                ))
                .toList();

        return ResponseEntity.ok(batches);
    }

    // POST /api/instructor/assignments - create, restricted to their own batches
    @PostMapping
    public ResponseEntity<Object> createAssignment(@RequestBody AssignmentRequestDTO dto) {
        Instructor instructor = currentInstructor();

        if (dto.getBatchId() == null) {
            return ResponseEntity.badRequest().body("batchId is required");
        }

        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        if (batch.getInstructor() == null || !batch.getInstructor().getId().equals(instructor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only create assignments for batches assigned to you");
        }

        // Force server-side, ignore whatever instructorId (if any) came in the request body
        dto.setInstructorId(instructor.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.createAssignment(dto));
    }

    // GET /api/instructor/assignments - list only assignments they created
    @GetMapping
    public ResponseEntity<Page<AssignmentResponseDTO>> getMyAssignments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long batchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Instructor instructor = currentInstructor();

        Pageable pageable = PageRequest.of(page, size,
                sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());

        return ResponseEntity.ok(assignmentService.getAllAssignments(search, status, batchId, instructor.getId(), pageable));
    }

    // GET /api/instructor/assignments/{id} - view one assignment, including its
    // decrypted question sets (AssignmentServiceImpl.mapToResponse already builds
    // this - we just gate it so an instructor can only view their OWN assignment).
    @GetMapping("/{id}")
    public ResponseEntity<Object> getAssignment(@PathVariable Long id) {
        Instructor instructor = currentInstructor();

        AssignmentResponseDTO assignment = assignmentService.getAssignmentById(id);

        if (assignment.getInstructorId() == null || !assignment.getInstructorId().equals(instructor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only view assignments you created");
        }

        return ResponseEntity.ok(assignment);
    }

    // PUT /api/instructor/assignments/{id} - update, only if they own it
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateAssignment(@PathVariable Long id, @RequestBody AssignmentRequestDTO dto) {
        Instructor instructor = currentInstructor();

        AssignmentResponseDTO existing = assignmentService.getAssignmentById(id);
        if (existing.getInstructorId() == null || !existing.getInstructorId().equals(instructor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only update assignments you created");
        }

        dto.setInstructorId(instructor.getId());

        return ResponseEntity.ok(assignmentService.updateAssignment(id, dto));
    }
}