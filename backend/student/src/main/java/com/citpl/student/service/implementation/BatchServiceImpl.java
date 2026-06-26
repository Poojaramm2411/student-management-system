package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.BatchRequestDTO;
import com.citpl.student.dto.Response.BatchResponseDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Instructor;
import com.citpl.student.model.Status;
import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService{

    private final BatchRepository batchRepository;
    private final InstructorRepository instructorRepository;

    public BatchResponseDTO createBatch(BatchRequestDTO dto) {
        Instructor instructor = instructorRepository.findById(dto.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + dto.getInstructorId()));

        Batch batch = Batch.builder()
                .batchName(dto.getBatchName())
                .batchCode(dto.getBatchCode())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(Status.valueOf(dto.getStatus()))
                .instructor(instructor)
                .build();

        return mapToResponse1(batchRepository.save(batch));
    }

    public BatchResponseDTO getBatchById(Long id) {
        return mapToResponse1(findById(id));
    }

    public Page<BatchResponseDTO> getAllBatches(String search, String status, Pageable pageable) {
        Status statusEnum = (status != null && !status.isBlank()) ? Status.valueOf(status) : null;
        return batchRepository.searchBatches(search, statusEnum, pageable)
                .map(this::mapToResponse1);
    }

    public BatchResponseDTO updateBatch(Long id, BatchRequestDTO dto) {
        Batch batch = findById(id);
        Instructor instructor = instructorRepository.findById(dto.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + dto.getInstructorId()));

        batch.setBatchName(dto.getBatchName());
        batch.setBatchCode(dto.getBatchCode());
        batch.setStartDate(dto.getStartDate());
        batch.setEndDate(dto.getEndDate());
        batch.setStatus(Status.valueOf(dto.getStatus()));
        batch.setInstructor(instructor);

        return mapToResponse1(batchRepository.save(batch));
    }

    public BatchResponseDTO toggleStatus(Long id) {
        Batch batch = findById(id);
        batch.setStatus(batch.getStatus() == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE);
        return mapToResponse1(batchRepository.save(batch));
    }

    public void deleteBatch(Long id) {
        batchRepository.delete(findById(id));
    }

    private Batch findById(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
    }

    private BatchResponseDTO mapToResponse1(Batch batch) {
        Instructor instructor = batch.getInstructor();
        return BatchResponseDTO.builder()
                .id(batch.getId())
                .batchName(batch.getBatchName())
                .batchCode(batch.getBatchCode())
                .startDate(batch.getStartDate())
                .endDate(batch.getEndDate())
                .status(batch.getStatus().name())
                .instructorId(instructor != null ? instructor.getId() : null)
                .instructorName(instructor != null ? instructor.getName() : "—")
                .build();
    }

    public Object createBatch(Object dto) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'createBatch'");
    }

    public Object updateBatch(Long id, Object dto) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateBatch'");
    }
}