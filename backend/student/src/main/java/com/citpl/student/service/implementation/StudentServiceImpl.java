package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.StudentRequestDTO;
import com.citpl.student.dto.Response.StudentResponseDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Status;
import com.citpl.student.model.Student;
import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.StudentRepository;
import com.citpl.student.service.StudentService;
import com.citpl.student.util.StudentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service                             
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {  
    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final StudentMapper studentMapper;

    @Override
    public StudentResponseDTO createStudent(StudentRequestDTO dto) {
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + dto.getBatchId()));

        Student student = studentMapper.toEntity(dto);
        student.setBatch(batch);

        return studentMapper.toDTO(studentRepository.save(student));
    }

    @Override
    public StudentResponseDTO getStudentById(Long id) {
        return studentMapper.toDTO(findById(id));
    }

    @Override
    public Page<StudentResponseDTO> getAllStudents(String search, String status, Long batchId, Pageable pageable) {
        Status statusEnum = (status != null && !status.isBlank()) ? Status.valueOf(status) : null;
        return studentRepository.searchStudents(search, statusEnum, batchId, pageable)
                .map(studentMapper::toDTO);
    }

    @Override
    public StudentResponseDTO updateStudent(Long id, StudentRequestDTO dto) {
        Student student = findById(id);
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + dto.getBatchId()));

        student.setName(dto.getName());
        student.setEmail(dto.getEmail());
        student.setAge(dto.getAge());
        student.setStudentCode(dto.getStudentCode());
        student.setCity(dto.getCity());
        student.setStatus(Status.valueOf(dto.getStatus()));
        student.setBatch(batch);

        return studentMapper.toDTO(studentRepository.save(student));
    }

    @Override
    public StudentResponseDTO toggleStatus(Long id) {
        Student student = findById(id);
        student.setStatus(student.getStatus() == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE);
        return studentMapper.toDTO(studentRepository.save(student));
    }

    @Override
    public void deleteStudent(Long id) {
        studentRepository.delete(findById(id));
    }

    private Student findById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }
}