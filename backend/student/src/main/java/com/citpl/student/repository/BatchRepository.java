package com.citpl.student.repository;

import com.citpl.student.model.Batch;
import com.citpl.student.model.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {

    boolean existsByBatchCode(String batchCode);

    List<Batch> findByInstructorId(Long instructorId);

    @Query("SELECT b FROM Batch b WHERE " +
           "(:search IS NULL OR LOWER(CONCAT(b.batchName, b.batchCode)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR b.status = :status)")
    Page<Batch> searchBatches(@Param("search") String search,
                               @Param("status") Status status,
                               Pageable pageable);
}