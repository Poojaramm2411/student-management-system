package com.citpl.student.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssignmentService<AssignmentResponseDTO, AssignmentRequestDTO> {

    AssignmentResponseDTO createAssignment(AssignmentRequestDTO dto);
    AssignmentResponseDTO getAssignmentById(Long id);
    Page<AssignmentResponseDTO> getAllAssignments(String search, String status, Long batchId,
                                                   Long instructorId, Pageable pageable);
    AssignmentResponseDTO updateAssignment(Long id, AssignmentRequestDTO dto);
    AssignmentResponseDTO changeStatus(Long id, String status);
    void deleteAssignment(Long id);
}