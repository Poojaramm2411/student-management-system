package com.citpl.student.repository;

import com.citpl.student.model.Assignment;
import com.citpl.student.model.AssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("SELECT a FROM Assignment a WHERE " +
           "(:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:batchId IS NULL OR a.batch.id = :batchId) " +
           "AND (:instructorId IS NULL OR a.instructor.id = :instructorId)")
    Page<Assignment> searchAssignments(@Param("search") String search,
                                        @Param("status") AssignmentStatus status,
                                        @Param("batchId") Long batchId,
                                        @Param("instructorId") Long instructorId,
                                        Pageable pageable);
}