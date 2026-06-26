package com.citpl.student.controller;

import com.citpl.student.dto.Request.BatchRequestDTO;
import com.citpl.student.dto.Response.BatchResponseDTO;
import com.citpl.student.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    @PostMapping
    public ResponseEntity<Object> createBatch(@RequestBody BatchRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(batchService.createBatch(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    @GetMapping
    public ResponseEntity<Page<BatchResponseDTO>> getAllBatches(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Pageable pageable = PageRequest.of(page, size,
                sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());
        return ResponseEntity.ok(batchService.getAllBatches(search, status, pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateBatch(@PathVariable Long id, @RequestBody BatchRequestDTO dto) {
        return ResponseEntity.ok(batchService.updateBatch(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Object> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }
}