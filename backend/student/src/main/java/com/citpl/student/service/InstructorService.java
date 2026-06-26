package com.citpl.student.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InstructorService<InstructorResponseDTO, InstructorRequestDTO> {

    InstructorResponseDTO createInstructor(InstructorRequestDTO dto);
    InstructorResponseDTO getInstructorById(Long id);
    Page<InstructorResponseDTO> getAllInstructors(String search, String status, Pageable pageable);
    InstructorResponseDTO updateInstructor(Long id, InstructorRequestDTO dto);
    InstructorResponseDTO toggleStatus(Long id);
    void deleteInstructor(Long id);
}