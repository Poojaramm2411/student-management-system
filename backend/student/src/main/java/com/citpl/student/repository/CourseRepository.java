package com.citpl.student.repository;

import com.citpl.student.model.Course;
import com.citpl.student.model.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByCourseCode(String courseCode);

    @Query("SELECT c FROM Course c WHERE " +
           "(:search IS NULL OR LOWER(CONCAT(c.courseName, c.courseCode, c.department)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:batchId IS NULL OR c.batch.id = :batchId)")
    Page<Course> searchCourses(@Param("search") String search,
                                @Param("status") Status status,
                                @Param("batchId") Long batchId,
                                Pageable pageable);
}