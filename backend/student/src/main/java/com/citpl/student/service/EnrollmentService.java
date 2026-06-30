package com.citpl.student.service;

import org.springframework.stereotype.Service;

import com.citpl.student.dto.EnrollmentDTO;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Course;
import com.citpl.student.model.Enrollment;
import com.citpl.student.model.Student;
import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.CourseRepository;
import com.citpl.student.repository.EnrollmentRepository;
import com.citpl.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;

    public List<EnrollmentDTO> getAll() {
        return enrollmentRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EnrollmentDTO getById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        return toDTO(enrollment);
    }

    public EnrollmentDTO create(EnrollmentDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .batch(batch)
                .studentName(student.getName())   // adjust if Student's getter differs
                .courseName(course.getCourseName())     // adjust if Course's getter differs
                .batchName(batch.getBatchName())       // adjust if Batch's getter differs
                .baseFee(dto.getBaseFee())
                .gstAmount(dto.getGstAmount())
                .totalFee(dto.getTotalFee())
                .paidAmount(dto.getPaidAmount())
                .feeStatus(dto.getFeeStatus())
                .paymentMode(dto.getPaymentMode())
                .enrolledDate(dto.getEnrolledDate())
                .status(dto.getStatus() != null ? dto.getStatus() : "Active")
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        return toDTO(saved);
    }

    public EnrollmentDTO update(Long id, EnrollmentDTO dto) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (dto.getStudentId() != null) {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            enrollment.setStudent(student);
            enrollment.setStudentName(student.getName());
        }
        if (dto.getCourseId() != null) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
                        enrollment.setCourse(course);
                        enrollment.setCourseName(course.getCourseName());
        }
        if (dto.getBatchId() != null) {
            Batch batch = batchRepository.findById(dto.getBatchId())
                    .orElseThrow(() -> new RuntimeException("Batch not found"));
            enrollment.setBatch(batch);
                        enrollment.setBatchName(batch.getBatchName());
        }

        enrollment.setBaseFee(dto.getBaseFee());
        enrollment.setGstAmount(dto.getGstAmount());
        enrollment.setTotalFee(dto.getTotalFee());
        enrollment.setPaidAmount(dto.getPaidAmount());
        enrollment.setFeeStatus(dto.getFeeStatus());
        enrollment.setPaymentMode(dto.getPaymentMode());
        enrollment.setEnrolledDate(dto.getEnrolledDate());
        if (dto.getStatus() != null) enrollment.setStatus(dto.getStatus());

        Enrollment updated = enrollmentRepository.save(enrollment);
        return toDTO(updated);
    }

    public void delete(Long id) {
        enrollmentRepository.deleteById(id);
    }

    public EnrollmentDTO getReceiptData(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        return toDTO(enrollment);
    }

    // ── Mapper: Entity → DTO ──────────────────────────────
    private EnrollmentDTO toDTO(Enrollment e) {
        return EnrollmentDTO.builder()
                .id(e.getId())
                .studentId(e.getStudent() != null ? e.getStudent().getId() : null)
                .courseId(e.getCourse() != null ? e.getCourse().getId() : null)
                .batchId(e.getBatch() != null ? e.getBatch().getId() : null)
                .studentName(e.getStudentName())
                .courseName(e.getCourseName())
                .batchName(e.getBatchName())
                .baseFee(e.getBaseFee())
                .gstAmount(e.getGstAmount())
                .totalFee(e.getTotalFee())
                .paidAmount(e.getPaidAmount())
                .feeStatus(e.getFeeStatus())
                .paymentMode(e.getPaymentMode())
                .enrolledDate(e.getEnrolledDate())
                .status(e.getStatus())
                .build();
    }
}