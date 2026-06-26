package com.citpl.student.util;

import com.citpl.student.dto.Request.StudentRequestDTO;
import com.citpl.student.dto.Response.StudentResponseDTO;
import com.citpl.student.model.Status;
import com.citpl.student.model.Student;
import org.springframework.stereotype.Component;

@Component
public class StudentMapper {

    public Student toEntity(StudentRequestDTO dto) {
        Student student = new Student();
        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setAge(dto.getAge());
        student.setStudentCode(dto.getStudentCode());
        student.setCity(dto.getCity());
        student.setStatus(Status.valueOf(dto.getStatus()));
        return student;
    }

    public StudentResponseDTO toDTO(Student student) {
        StudentResponseDTO dto = new StudentResponseDTO();
        dto.setId(student.getId());
        dto.setName(student.getName());
        dto.setEmail(student.getEmail());
        dto.setAge(student.getAge());
        dto.setStudentCode(student.getStudentCode());
        dto.setCity(student.getCity());
        dto.setStatus(student.getStatus().name());

        if (student.getBatch() != null) {
            dto.setBatchId(student.getBatch().getId());
            dto.setBatchName(student.getBatch().getBatchName());
        }
        return dto;
    }
}