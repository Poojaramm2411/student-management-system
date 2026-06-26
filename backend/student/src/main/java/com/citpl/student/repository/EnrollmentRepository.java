package com.citpl.student.repository;

import com.citpl.student.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByFeeStatus(String feeStatus);

    List<Enrollment> findByStudentId(Long studentId);

    List<Enrollment> findByCourseId(Long courseId);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.feeStatus = 'Paid'")
    long countPaid();

    @Query("SELECT COALESCE(SUM(e.paidAmount), 0) FROM Enrollment e")
    Double totalRevenue();

    @Query("SELECT MONTH(e.enrolledDate) as month, COUNT(e) as count " +
           "FROM Enrollment e GROUP BY MONTH(e.enrolledDate) ORDER BY MONTH(e.enrolledDate)")
    List<Object[]> monthlyEnrollmentCounts();
}