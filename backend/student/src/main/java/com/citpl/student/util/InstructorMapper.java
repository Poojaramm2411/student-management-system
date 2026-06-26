package com.citpl.student.util;

import org.springframework.stereotype.Component;

import com.citpl.student.dto.Request.InstructorRequestDTO;
import com.citpl.student.dto.Response.InstructorResponseDTO;
import com.citpl.student.model.Instructor;

@Component
public class InstructorMapper {

    public Instructor toEntity(InstructorRequestDTO dto) {
        Instructor instructor = new Instructor();
        instructor.setName(dto.getName());
        instructor.setEmail(dto.getEmail());
        instructor.setPhone(dto.getPhone());
        instructor.setSpecialization(dto.getSpecialization());
        return instructor;
    }

    public InstructorResponseDTO toDTO(Instructor instructor) {
        InstructorResponseDTO dto = new InstructorResponseDTO();
        dto.setId(instructor.getId());
        dto.setName(instructor.getName());
        dto.setEmail(instructor.getEmail());
        dto.setPhone(instructor.getPhone());
        dto.setSpecialization(instructor.getSpecialization());
        return dto;
    }
}