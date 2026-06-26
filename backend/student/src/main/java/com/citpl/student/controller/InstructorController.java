package com.citpl.student.controller;

import com.citpl.student.dto.Request.InstructorRequestDTO;
import com.citpl.student.dto.Response.InstructorResponseDTO;
import com.citpl.student.service.InstructorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
public class InstructorController {

    private final InstructorService instructorService;

    @PostMapping
    public ResponseEntity<Object> createInstructor(@RequestBody InstructorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(instructorService.createInstructor(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getInstructorById(@PathVariable Long id) {
        return ResponseEntity.ok(instructorService.getInstructorById(id));
    }

    @GetMapping
    public ResponseEntity<Page<InstructorResponseDTO>> getAllInstructors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Pageable pageable = PageRequest.of(page, size,
                sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());
        return ResponseEntity.ok(instructorService.getAllInstructors(search, status, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateInstructor(@PathVariable Long id, @RequestBody InstructorRequestDTO dto) {
        return ResponseEntity.ok(instructorService.updateInstructor(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(instructorService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstructor(@PathVariable Long id) {
        instructorService.deleteInstructor(id);
        return ResponseEntity.noContent().build();
    }
}