package com.citpl.student.util;

import com.citpl.student.model.Course;
import com.citpl.student.dto.Request.CourseRequestDTO;
import com.citpl.student.dto.Response.CourseResponseDTO;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Instructor;
import com.citpl.student.model.Status;
import org.springframework.stereotype.Component;

@Component
public class CourseMapper {

    public Course toEntity(CourseRequestDTO dto) {
        return Course.builder()
                .courseName(dto.getCourseName())
                .courseCode(dto.getCourseCode())
                .description(dto.getDescription())
                .department(dto.getDepartment())
                .duration(dto.getDuration())
                .fee(dto.getFee())
                .status(dto.getStatus() != null ? Status.valueOf(dto.getStatus()) : Status.ACTIVE)
                .build();
    }

    public Course toEntity(CourseRequestDTO dto, Batch batch, Instructor instructor) {
        return Course.builder()
                .courseName(dto.getCourseName())
                .courseCode(dto.getCourseCode())
                .description(dto.getDescription())
                .department(dto.getDepartment())
                .duration(dto.getDuration())
                .fee(dto.getFee())
                .batch(batch)
                .batchName(batch != null ? batch.getBatchName() : null)
                .instructor(instructor)
                .status(dto.getStatus() != null ? Status.valueOf(dto.getStatus()) : Status.ACTIVE)
                .build();
    }

    public CourseResponseDTO toDTO(Course course) {
        return CourseResponseDTO.builder()
                .id(course.getId())
                .courseName(course.getCourseName())
                .courseCode(course.getCourseCode())
                .description(course.getDescription())
                .department(course.getDepartment())
                .duration(course.getDuration())
                .fee(course.getFee())
                .batchId(course.getBatch() != null ? course.getBatch().getId() : null)
                .batchName(course.getBatch() != null
                        ? course.getBatch().getBatchName()
                        : course.getBatchName()) // fallback to denormalized field
                .instructorId(course.getInstructor() != null ? course.getInstructor().getId() : null)
                .instructorName(course.getInstructor() != null ? course.getInstructor().getName() : null)
                .status(course.getStatus().name())
                .build();
    }
}