package com.citpl.student.util;

import org.springframework.stereotype.Component;

import com.citpl.student.dto.Request.BatchRequestDTO;
import com.citpl.student.dto.Response.BatchResponseDTO;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Status;

@Component
public class BatchMapper {

    public Batch toEntity(BatchRequestDTO dto) {

        Batch batch = new Batch();

        batch.setBatchName(dto.getBatchName());
        batch.setStartDate(dto.getStartDate());
        batch.setEndDate(dto.getEndDate());
        batch.setStatus(Status.valueOf(dto.getStatus())); // ← String to Enum

        return batch;
    }

    public BatchResponseDTO toDTO(Batch batch) {

        BatchResponseDTO dto = new BatchResponseDTO();

        dto.setId(batch.getId());
        dto.setBatchName(batch.getBatchName());
        dto.setStartDate(batch.getStartDate());
        dto.setEndDate(batch.getEndDate());
        dto.setStatus(batch.getStatus().name()); // ← Enum to String

        // instructor info (avoid null pointer)
        if (batch.getInstructor() != null) {
            dto.setInstructorId(batch.getInstructor().getId());
            dto.setInstructorName(batch.getInstructor().getName());
        }

        return dto;
    }
}