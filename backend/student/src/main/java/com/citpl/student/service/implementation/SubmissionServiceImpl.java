package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.GradeSubmissionRequestDTO;
import com.citpl.student.dto.Request.SubmissionRequestDTO;
import com.citpl.student.dto.Response.SubmissionResponseDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Assignment;
import com.citpl.student.model.AssignmentSubmission;
import com.citpl.student.model.Instructor;
import com.citpl.student.model.Student;
import com.citpl.student.model.SubmissionStatus;
import com.citpl.student.repository.AssignmentRepository;
import com.citpl.student.repository.AssignmentSubmissionRepository;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.repository.StudentRepository;
import com.citpl.student.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;

    @Override
    public SubmissionResponseDTO submit(Long assignmentId, SubmissionRequestDTO dto) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));

        // Upsert: a student can resubmit before grading, but only one row per (assignment, student)
        AssignmentSubmission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, dto.getStudentId())
                .orElse(AssignmentSubmission.builder()
                        .assignment(assignment)
                        .student(student)
                        .build());

        submission.setContent(dto.getContent());
        submission.setFileUrl(dto.getFileUrl());
        submission.setLinkUrl(dto.getLinkUrl());
        submission.setSubmittedAt(LocalDateTime.now());

        boolean isLate = assignment.getDueDate() != null && LocalDate.now().isAfter(assignment.getDueDate());
        submission.setStatus(isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED);

        return mapToResponse(submissionRepository.save(submission));
    }

    @Override
    public SubmissionResponseDTO getSubmissionById(Long id) {
        return mapToResponse(findById(id));
    }

    @Override
    public Page<SubmissionResponseDTO> getSubmissionsForAssignment(Long assignmentId, Pageable pageable) {
        return submissionRepository.findByAssignmentId(assignmentId, pageable).map(this::mapToResponse);
    }

    @Override
    public Page<SubmissionResponseDTO> getSubmissionsForStudent(Long studentId, Pageable pageable) {
        return submissionRepository.findByStudentId(studentId, pageable).map(this::mapToResponse);
    }

    @Override
    public SubmissionResponseDTO grade(Long submissionId, GradeSubmissionRequestDTO dto) {
        AssignmentSubmission submission = findById(submissionId);
        Instructor grader = instructorRepository.findById(dto.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + dto.getInstructorId()));

        submission.setMarksObtained(dto.getMarksObtained());
        submission.setFeedback(dto.getFeedback());
        submission.setGradedBy(grader);
        submission.setGradedAt(LocalDateTime.now());
        submission.setStatus(SubmissionStatus.GRADED);

        return mapToResponse(submissionRepository.save(submission));
    }

    private AssignmentSubmission findById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));
    }

    private SubmissionResponseDTO mapToResponse(AssignmentSubmission s) {
        SubmissionResponseDTO.SubmissionResponseDTOBuilder builder = SubmissionResponseDTO.builder()
                .id(s.getId())
                .submittedAt(s.getSubmittedAt())
                .content(s.getContent())
                .fileUrl(s.getFileUrl())
                .linkUrl(s.getLinkUrl())
                .status(s.getStatus().name())
                .marksObtained(s.getMarksObtained())
                .feedback(s.getFeedback())
                .gradedAt(s.getGradedAt())
                .assignedSet(s.getAssignedSet())
                .triedSets(s.getTriedSets());

        if (s.getAssignment() != null) {
            builder.assignmentId(s.getAssignment().getId())
                   .assignmentTitle(s.getAssignment().getTitle())
                   .maxMarks(s.getAssignment().getMaxMarks());
        }
        if (s.getStudent() != null) {
            builder.studentId(s.getStudent().getId())
                   .studentName(s.getStudent().getName());
        }
        if (s.getGradedBy() != null) {
            builder.gradedByName(s.getGradedBy().getName());
        }

        return builder.build();
    }
}