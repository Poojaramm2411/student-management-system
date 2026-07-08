package com.citpl.student.repository;

import com.citpl.student.model.AssignmentSubmission;
import com.citpl.student.model.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {

    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);

    Page<AssignmentSubmission> findByAssignmentId(Long assignmentId, Pageable pageable);

    Page<AssignmentSubmission> findByStudentId(Long studentId, Pageable pageable);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    long countByAssignmentId(Long assignmentId);

    long countByAssignmentIdAndStatus(Long assignmentId, SubmissionStatus status);
}