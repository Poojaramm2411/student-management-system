package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.InstructorRequestDTO;
import com.citpl.student.dto.Response.InstructorResponseDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Instructor;
import com.citpl.student.model.Status;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.service.InstructorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InstructorServiceImpl implements InstructorService {

    private final InstructorRepository instructorRepository;

    @Override
    public Object createInstructor(Object dto) {
        InstructorRequestDTO requestDTO = (InstructorRequestDTO) dto;
        Instructor instructor = Instructor.builder()
                .name(requestDTO.getName())
                .email(requestDTO.getEmail())
                .phone(requestDTO.getPhone())
                .specialization(requestDTO.getSpecialization())
                .status(requestDTO.getStatus() != null ? Status.valueOf(requestDTO.getStatus()) : Status.ACTIVE)
                .build();
        return mapToResponse(instructorRepository.save(instructor));
    }

    @Override
    public Object getInstructorById(Long id) {
        return mapToResponse(findById(id));
    }

    @Override
    public Page<Object> getAllInstructors(String search, String status, Pageable pageable) {
        Status statusEnum = (status != null && !status.isBlank()) ? Status.valueOf(status) : null;
        return instructorRepository.searchInstructors(search, statusEnum, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Object updateInstructor(Long id, Object dto) {
        InstructorRequestDTO requestDTO = (InstructorRequestDTO) dto;
        Instructor instructor = findById(id);
        instructor.setName(requestDTO.getName());
        instructor.setEmail(requestDTO.getEmail());
        instructor.setPhone(requestDTO.getPhone());
        instructor.setSpecialization(requestDTO.getSpecialization());
        instructor.setStatus(Status.valueOf(requestDTO.getStatus()));
        return mapToResponse(instructorRepository.save(instructor));
    }

    @Override
    public Object toggleStatus(Long id) {
        Instructor instructor = findById(id);
        instructor.setStatus(instructor.getStatus() == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE);
        return mapToResponse(instructorRepository.save(instructor));
    }

    @Override
    public void deleteInstructor(Long id) {
        instructorRepository.delete(findById(id));
    }

    private Instructor findById(Long id) {
        return instructorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + id));
    }

    private Object mapToResponse(Instructor instructor) {
        return InstructorResponseDTO.builder()
                .id(instructor.getId())
                .name(instructor.getName())
                .email(instructor.getEmail())
                .phone(instructor.getPhone())
                .specialization(instructor.getSpecialization())
                .status(instructor.getStatus().name())
                .build();
    }
}