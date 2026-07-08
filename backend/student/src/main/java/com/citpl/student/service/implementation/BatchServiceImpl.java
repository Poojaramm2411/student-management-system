package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.BatchRequestDTO;
import com.citpl.student.dto.Response.BatchResponseDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Course;
import com.citpl.student.model.Instructor;
import com.citpl.student.model.Status;
import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.CourseRepository;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService<BatchResponseDTO, BatchRequestDTO> {

    private final BatchRepository batchRepository;
    private final CourseRepository courseRepository;
    private final InstructorRepository instructorRepository;

    @Override
    public BatchResponseDTO createBatch(BatchRequestDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));

        Instructor instructor = null;
        if (dto.getInstructorId() != null) {
            instructor = instructorRepository.findById(dto.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + dto.getInstructorId()));
        }

        Batch batch = Batch.builder()
                .batchName(dto.getBatchName())
                .batchCode(dto.getBatchCode())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(Status.valueOf(dto.getStatus()))
                .course(course)
                .instructor(instructor)
                .build();

        return mapToResponse(batchRepository.save(batch));
    }

    @Override
    public BatchResponseDTO getBatchById(Long id) {
        return mapToResponse(findById(id));
    }

    @Override
    public Page<BatchResponseDTO> getAllBatches(String search, String status, Pageable pageable) {
        Status statusEnum = (status != null && !status.isBlank()) ? Status.valueOf(status) : null;
        return batchRepository.searchBatches(search, statusEnum, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public BatchResponseDTO updateBatch(Long id, BatchRequestDTO dto) {
        Batch batch = findById(id);
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));

        Instructor instructor = null;
        if (dto.getInstructorId() != null) {
            instructor = instructorRepository.findById(dto.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + dto.getInstructorId()));
        }

        batch.setBatchName(dto.getBatchName());
        batch.setBatchCode(dto.getBatchCode());
        batch.setStartDate(dto.getStartDate());
        batch.setEndDate(dto.getEndDate());
        batch.setStatus(Status.valueOf(dto.getStatus()));
        batch.setCourse(course);
        batch.setInstructor(instructor);

        return mapToResponse(batchRepository.save(batch));
    }

    @Override
    public BatchResponseDTO toggleStatus(Long id) {
        Batch batch = findById(id);
        batch.setStatus(batch.getStatus() == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE);
        return mapToResponse(batchRepository.save(batch));
    }

    @Override
    public void deleteBatch(Long id) {
        batchRepository.delete(findById(id));
    }

    private Batch findById(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
    }

    private BatchResponseDTO mapToResponse(Batch batch) {
        BatchResponseDTO.BatchResponseDTOBuilder builder = BatchResponseDTO.builder()
                .id(batch.getId())
                .batchName(batch.getBatchName())
                .batchCode(batch.getBatchCode())
                .startDate(batch.getStartDate())
                .endDate(batch.getEndDate())
                .status(batch.getStatus().name());

        if (batch.getCourse() != null) {
            builder.courseId(batch.getCourse().getId())
                   .courseName(batch.getCourse().getCourseName());
        }

        if (batch.getInstructor() != null) {
            builder.instructorId(batch.getInstructor().getId())
                   .instructorName(batch.getInstructor().getName());
        }

        return builder.build();
    }
}