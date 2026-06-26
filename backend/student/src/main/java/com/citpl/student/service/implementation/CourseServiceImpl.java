package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.CourseRequestDTO;
import com.citpl.student.dto.Response.CourseResponseDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Course;
import com.citpl.student.model.Status;
import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.CourseRepository;
import com.citpl.student.service.CourseService;
import com.citpl.student.util.CourseMapper;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service                          // ← must have this
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {   // ← must implement CourseService

    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final CourseMapper courseMapper;

    @Override
    public CourseResponseDTO createCourse(CourseRequestDTO dto) {
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + dto.getBatchId()));

        Course course = courseMapper.toEntity(dto);
        course.setBatch(batch);

        return courseMapper.toDTO(courseRepository.save(course));
    }

    @Override
    public CourseResponseDTO getCourseById(Long id) {
        Course course = findById(id);
        return courseMapper.toDTO(course);
    }

    public Page<CourseResponseDTO> getAllCourses(String search, String status, Long batchId, Pageable pageable) {
        Status statusEnum = (status != null && !status.isBlank()) ? Status.valueOf(status) : null;
        return courseRepository.searchCourses(search, statusEnum, batchId, pageable)
                .map(courseMapper::toDTO);
    }

    @Override
    public CourseResponseDTO updateCourse(Long id, CourseRequestDTO dto) {
        Course course = findById(id);
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + dto.getBatchId()));

        course.setCourseName(dto.getCourseName());
        course.setDepartment(dto.getDepartment());
        course.setDuration(dto.getDuration());
        course.setStatus(Status.valueOf(dto.getStatus()));
        course.setBatch(batch);

        return courseMapper.toDTO(courseRepository.save(course));
    }

    @Override
    public CourseResponseDTO toggleStatus(Long id) {
        Course course = findById(id);
        course.setStatus(course.getStatus() == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE);
        return courseMapper.toDTO(courseRepository.save(course));
    }

    @Override
    public void deleteCourse(Long id) {
        courseRepository.delete(findById(id));
    }

    private Course findById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Override
    public List<CourseResponseDTO> getAllCourses() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getAllCourses'");
    }

    @Override
    public Page<CourseResponseDTO> getCourses(String search, String status, Pageable pageable) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getCourses'");
    }

    @Override
    public CourseResponseDTO updateStatus(Long id, String status) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateStatus'");
    }
}