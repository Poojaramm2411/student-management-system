package com.citpl.student.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BatchService<BatchResponseDTO, BatchRequestDTO> {

    BatchResponseDTO createBatch(BatchRequestDTO dto);
    BatchResponseDTO getBatchById(Long id);
    Page<BatchResponseDTO> getAllBatches(String search, String status, Pageable pageable);
    BatchResponseDTO updateBatch(Long id, BatchRequestDTO dto);
    BatchResponseDTO toggleStatus(Long id);
    void deleteBatch(Long id);
    BatchResponseDTO createBatch(com.citpl.student.dto.Request.BatchRequestDTO dto);
    BatchResponseDTO updateBatch(Long id, com.citpl.student.dto.Request.BatchRequestDTO dto);
}