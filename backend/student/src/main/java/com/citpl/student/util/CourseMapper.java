package com.citpl.student.util;

import com.citpl.student.model.Course;
import com.citpl.student.dto.Request.CourseRequestDTO;
import com.citpl.student.dto.Response.CourseResponseDTO;
import com.citpl.student.model.Status;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toEntity(CourseRequestDTO dto) {
        return Course.builder()
                .courseName(dto.getCourseName())
                .courseCode(dto.getCourseCode())
                .duration(dto.getDuration())
                .fee(dto.getFee())
                .status(dto.getStatus() != null ? Status.valueOf(dto.getStatus()) : Status.ACTIVE)
                .build();
    }

    public CourseResponseDTO toDTO(Course course) {
        return CourseResponseDTO.builder()
                .id(course.getId())
                .courseName(course.getCourseName())
                .courseCode(course.getCourseCode())
                .duration(course.getDuration())
                .fee(course.getFee())
                .status(course.getStatus().name())
                .build();
    }
}