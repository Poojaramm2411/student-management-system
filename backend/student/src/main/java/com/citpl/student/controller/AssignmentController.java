package com.citpl.student.controller;

import com.citpl.student.dto.Response.AssignmentResponseDTO;
import com.citpl.student.dto.Request.AssignmentRequestDTO;
import com.citpl.student.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService<AssignmentResponseDTO, AssignmentRequestDTO> assignmentService;

    @PostMapping
    public ResponseEntity<Object> createAssignment(@RequestBody AssignmentRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.createAssignment(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @GetMapping
    public ResponseEntity<Page<AssignmentResponseDTO>> getAllAssignments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long batchId,
            @RequestParam(required = false) Long instructorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Pageable pageable = PageRequest.of(page, size,
                sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());
        return ResponseEntity.ok(assignmentService.getAllAssignments(search, status, batchId, instructorId, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateAssignment(@PathVariable Long id, @RequestBody AssignmentRequestDTO dto) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> changeStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(assignmentService.changeStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}