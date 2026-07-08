package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.AssignmentRequestDTO;
import com.citpl.student.dto.Response.AssignmentResponseDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Assignment;
import com.citpl.student.model.AssignmentStatus;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Instructor;
import com.citpl.student.model.SubmissionStatus;
import com.citpl.student.model.SubmissionType;
import com.citpl.student.repository.AssignmentRepository;
import com.citpl.student.repository.AssignmentSubmissionRepository;
import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AssignmentServiceImpl implements AssignmentService<AssignmentResponseDTO, AssignmentRequestDTO> {

    private final AssignmentRepository assignmentRepository;
    private final BatchRepository batchRepository;
    private final InstructorRepository instructorRepository;
    private final AssignmentSubmissionRepository submissionRepository;

    @Override
    public AssignmentResponseDTO createAssignment(AssignmentRequestDTO dto) {
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + dto.getBatchId()));
        Instructor instructor = instructorRepository.findById(dto.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + dto.getInstructorId()));

        Assignment assignment = Assignment.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .batch(batch)
                .instructor(instructor)
                .assignedDate(dto.getAssignedDate() != null ? dto.getAssignedDate() : LocalDate.now())
                .dueDate(dto.getDueDate())
                .maxMarks(dto.getMaxMarks())
                .attachmentUrl(dto.getAttachmentUrl())
                .submissionType(SubmissionType.valueOf(dto.getSubmissionType()))
                .status(dto.getStatus() != null ? AssignmentStatus.valueOf(dto.getStatus()) : AssignmentStatus.DRAFT)
                .build();

        return mapToResponse(assignmentRepository.save(assignment));
    }

    @Override
    public AssignmentResponseDTO getAssignmentById(Long id) {
        return mapToResponse(findById(id));
    }

    @Override
    public Page<AssignmentResponseDTO> getAllAssignments(String search, String status, Long batchId,
                                                           Long instructorId, Pageable pageable) {
        AssignmentStatus statusEnum = (status != null && !status.isBlank()) ? AssignmentStatus.valueOf(status) : null;
        return assignmentRepository.searchAssignments(search, statusEnum, batchId, instructorId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public AssignmentResponseDTO updateAssignment(Long id, AssignmentRequestDTO dto) {
        Assignment assignment = findById(id);
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + dto.getBatchId()));
        Instructor instructor = instructorRepository.findById(dto.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + dto.getInstructorId()));

        assignment.setTitle(dto.getTitle());
        assignment.setDescription(dto.getDescription());
        assignment.setBatch(batch);
        assignment.setInstructor(instructor);
        if (dto.getAssignedDate() != null) assignment.setAssignedDate(dto.getAssignedDate());
        assignment.setDueDate(dto.getDueDate());
        assignment.setMaxMarks(dto.getMaxMarks());
        assignment.setAttachmentUrl(dto.getAttachmentUrl());
        assignment.setSubmissionType(SubmissionType.valueOf(dto.getSubmissionType()));
        if (dto.getStatus() != null) assignment.setStatus(AssignmentStatus.valueOf(dto.getStatus()));

        return mapToResponse(assignmentRepository.save(assignment));
    }

    @Override
    public AssignmentResponseDTO changeStatus(Long id, String status) {
        Assignment assignment = findById(id);
        assignment.setStatus(AssignmentStatus.valueOf(status));
        return mapToResponse(assignmentRepository.save(assignment));
    }

    @Override
    public void deleteAssignment(Long id) {
        assignmentRepository.delete(findById(id));
    }

    private Assignment findById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
    }

    private AssignmentResponseDTO mapToResponse(Assignment a) {
        AssignmentResponseDTO.AssignmentResponseDTOBuilder builder = AssignmentResponseDTO.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .assignedDate(a.getAssignedDate())
                .dueDate(a.getDueDate())
                .maxMarks(a.getMaxMarks())
                .attachmentUrl(a.getAttachmentUrl())
                .submissionType(a.getSubmissionType().name())
                .status(a.getStatus().name());

        if (a.getBatch() != null) {
            builder.batchId(a.getBatch().getId())
                   .batchName(a.getBatch().getBatchName());
            if (a.getBatch().getCourse() != null) {
                builder.courseId(a.getBatch().getCourse().getId())
                       .courseName(a.getBatch().getCourse().getCourseName());
            }
        }

        if (a.getInstructor() != null) {
            builder.instructorId(a.getInstructor().getId())
                   .instructorName(a.getInstructor().getName());
        }

        long total = submissionRepository.countByAssignmentId(a.getId());
        long graded = submissionRepository.countByAssignmentIdAndStatus(a.getId(), SubmissionStatus.GRADED);
        builder.totalSubmissions(total).gradedSubmissions(graded);

        return builder.build();
    }
}