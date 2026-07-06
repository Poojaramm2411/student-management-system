package com.citpl.student.repository;

import com.citpl.student.model.Batch;
import com.citpl.student.model.Status;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByStartDate(LocalDate startDate);
    boolean existsByBatchCode(String batchCode);

    @Query("SELECT b FROM Batch b WHERE " +
           "(:search IS NULL OR LOWER(CONCAT(b.batchName, b.batchCode)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR b.status = :status)")
    Page<Batch> searchBatches(@Param("search") String search,
                               @Param("status") Status status,
                               Pageable pageable);
}