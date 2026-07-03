package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.CourseRequestDTO;
import com.citpl.student.dto.Response.CourseResponseDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Course;
import com.citpl.student.model.Status;
import com.citpl.student.repository.CourseRepository;
import com.citpl.student.service.CourseService;
import com.citpl.student.util.CourseMapper;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    @Override
public CourseResponseDTO createCourse(CourseRequestDTO dto) {
     if (courseRepository.existsByCourseCode(dto.getCourseCode())) {
        throw new IllegalArgumentException("Course code already exists: " + dto.getCourseCode());
    }
    if (courseRepository.existsByCourseNameIgnoreCase(dto.getCourseName())) {
        throw new IllegalArgumentException("Course name already exists: " + dto.getCourseName());
    }
    Course course = courseMapper.toEntity(dto);
    return courseMapper.toDTO(courseRepository.save(course));
}

    @Override
    public CourseResponseDTO getCourseById(Long id) {
        return courseMapper.toDTO(findById(id));
    }

    @Override
    public Page<CourseResponseDTO> getAllCourses(String search, String status, Pageable pageable) {
        Status statusEnum = (status != null && !status.isBlank()) ? Status.valueOf(status) : null;
        return courseRepository.searchCourses(search, statusEnum, pageable)
                .map(courseMapper::toDTO);
    }

    @Override
    public CourseResponseDTO updateCourse(Long id, CourseRequestDTO dto) {
        Course course = findById(id);
        course.setCourseName(dto.getCourseName());
        course.setCourseCode(dto.getCourseCode());
        course.setDuration(dto.getDuration());
        course.setFee(dto.getFee());
        course.setStatus(Status.valueOf(dto.getStatus()));
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

    @Override
    public CourseResponseDTO updateStatus(Long id, String status) {
        Course course = findById(id);
        course.setStatus(Status.valueOf(status));
        return courseMapper.toDTO(courseRepository.save(course));
    }

    @Override
    public List<CourseResponseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(courseMapper::toDTO)
                .toList();
    }

    @Override
    public Page<CourseResponseDTO> getCourses(String search, String status, Pageable pageable) {
        Status statusEnum = (status != null && !status.isBlank()) ? Status.valueOf(status) : null;
        return courseRepository.searchCourses(search, statusEnum, pageable)
                .map(courseMapper::toDTO);
    }

    private Course findById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    @Override
    public List<CourseResponseDTO> getAllCoursesNoPaging(String search, String status) {
        return courseRepository.findAll().stream()
                .filter(c -> search == null || search.isBlank() ||
                        (c.getCourseName() != null &&
                         c.getCourseName().toLowerCase().contains(search.toLowerCase())))
                .filter(c -> status == null || status.isBlank() ||
                        c.getStatus().name().equalsIgnoreCase(status))
                .map(courseMapper::toDTO)
                .toList();
    }
}