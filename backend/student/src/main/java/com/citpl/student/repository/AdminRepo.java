package com.citpl.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.citpl.student.model.Admin;


public interface AdminRepo extends JpaRepository<Admin, Long> {

    Admin findByEmail(String email);

    boolean existsByEmail(String email);
}
