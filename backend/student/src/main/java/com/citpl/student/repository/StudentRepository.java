package com.citpl.student.repository;

import com.citpl.student.model.Status;
import com.citpl.student.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByEmail(String email);
    boolean existsByStudentCode(String studentCode);

    @Query("SELECT s FROM Student s WHERE " +
           "(:search IS NULL OR LOWER(CONCAT(s.name, s.email, s.studentCode, s.city)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:batchId IS NULL OR s.batch.id = :batchId)")
    Page<Student> searchStudents(@Param("search") String search,
                                  @Param("status") Status status,
                                  @Param("batchId") Long batchId,
                                  Pageable pageable);
}