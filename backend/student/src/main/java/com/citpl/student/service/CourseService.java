package com.citpl.student.service;

import com.citpl.student.dto.Request.CourseRequestDTO;
import com.citpl.student.dto.Response.CourseResponseDTO;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CourseService {

    CourseResponseDTO createCourse(CourseRequestDTO dto);

    CourseResponseDTO getCourseById(Long id);

    Page<CourseResponseDTO> getAllCourses(String search, String status, Long batchId, Pageable pageable);

    CourseResponseDTO updateCourse(Long id, CourseRequestDTO dto);

    CourseResponseDTO toggleStatus(Long id);

    void deleteCourse(Long id);

    List<CourseResponseDTO> getAllCourses();

    Page<CourseResponseDTO> getCourses(String search, String status, Pageable pageable);

    CourseResponseDTO updateStatus(Long id, String status);
}