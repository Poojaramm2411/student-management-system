package com.citpl.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.citpl.student.model.Admin;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByEmail(String email);

    boolean existsByEmail(String email);
}