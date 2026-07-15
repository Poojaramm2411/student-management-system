package com.citpl.student.repository;

import com.citpl.student.model.Instructor;
import com.citpl.student.model.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long> {

    boolean existsByEmail(String email);

    // ADDED - needed to resolve "who is the logged-in instructor" from their JWT email,
    // same pattern StudentRepository already uses for the student side.
    Optional<Instructor> findByEmail(String email);

    @Query("SELECT i FROM Instructor i WHERE " +
           "(:search IS NULL OR LOWER(CONCAT(i.name, i.email, i.specialization)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR i.status = :status)")
    Page<Instructor> searchInstructors(@Param("search") String search,
                                        @Param("status") Status status,
                                        Pageable pageable);
}