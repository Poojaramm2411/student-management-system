package com.citpl.student.service;

import com.citpl.student.dto.Request.GradeSubmissionRequestDTO;
import com.citpl.student.dto.Request.SubmissionRequestDTO;
import com.citpl.student.dto.Response.SubmissionResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SubmissionService {

    SubmissionResponseDTO submit(Long assignmentId, SubmissionRequestDTO dto);
    SubmissionResponseDTO getSubmissionById(Long id);
    Page<SubmissionResponseDTO> getSubmissionsForAssignment(Long assignmentId, Pageable pageable);
    Page<SubmissionResponseDTO> getSubmissionsForStudent(Long studentId, Pageable pageable);
    SubmissionResponseDTO grade(Long submissionId, GradeSubmissionRequestDTO dto);
}