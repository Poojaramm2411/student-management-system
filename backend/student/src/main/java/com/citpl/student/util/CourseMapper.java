package com.citpl.student.util;

import org.springframework.stereotype.Component;

import com.citpl.student.dto.Request.CourseRequestDTO;
import com.citpl.student.dto.Response.CourseResponseDTO;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Course;
import com.citpl.student.model.Status;

@Component
public class CourseMapper {

    public Course toEntity(CourseRequestDTO dto) {
        Course course = new Course();
        course.setCourseName(dto.getCourseName());
        course.setCourseCode(dto.getCourseCode());
        course.setDescription(dto.getDescription());
        course.setDepartment(dto.getDepartment());
        // ✅ convert Integer to String safely
        course.setDuration(dto.getDuration() != null ? String.valueOf(dto.getDuration()) : null);
        course.setStatus(dto.getStatus() != null ? Status.valueOf(dto.getStatus()) : Status.ACTIVE);
        return course;
    }

    public CourseResponseDTO toDTO(Course course) {
        CourseResponseDTO dto = new CourseResponseDTO();
        dto.setId(course.getId());
        dto.setCourseName(course.getCourseName());
        dto.setCourseCode(course.getCourseCode());
        dto.setDescription(course.getDescription());
        dto.setDepartment(course.getDepartment());
        dto.setDuration(course.getDuration());
        dto.setStatus(course.getStatus() != null ? course.getStatus().name() : "ACTIVE");
        Batch batch = course.getBatch();
        if (batch != null) {
            dto.setBatchId(batch.getId());
            dto.setBatchName(batch.getBatchName());
        }
        return dto;
    }
}