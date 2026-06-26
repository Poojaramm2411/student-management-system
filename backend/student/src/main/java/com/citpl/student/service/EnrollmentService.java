package com.citpl.student.service;

import com.citpl.student.dto.EnrollmentDTO;
import com.citpl.student.model.*;
import com.citpl.student.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepo;
    private final StudentRepository    studentRepo;
    private final CourseRepository     courseRepo;
    private final BatchRepository      batchRepo;

    private static final double GST_RATE = 0.18;

    public List<EnrollmentDTO> getAll() {
        return enrollmentRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public EnrollmentDTO getById(Long id) {
        return enrollmentRepo.findById(id).map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Enrollment not found: " + id));
    }

    public EnrollmentDTO create(EnrollmentDTO dto) {
        Enrollment e = new Enrollment();

        if (dto.getStudentId() != null) {
            Student s = studentRepo.findById(dto.getStudentId()).orElse(null);
            e.setStudent(s);
            e.setStudentName(s != null ? s.getName() : dto.getStudentName());
        } else {
            e.setStudentName(dto.getStudentName());
        }

        if (dto.getCourseId() != null) {
            Course c = courseRepo.findById(dto.getCourseId()).orElse(null);
            e.setCourse(c);
            e.setCourseName(c != null ? c.getCourseName() : dto.getCourseName());

            if (c != null && (dto.getBaseFee() == null || dto.getBaseFee() == 0)) {
                double base = c.getFee() != null ? c.getFee() : 0;
                double gst  = Math.round(base * GST_RATE * 100.0) / 100.0;
                e.setBaseFee(base);
                e.setGstAmount(gst);
                e.setTotalFee(Math.round((base + gst) * 100.0) / 100.0);
            } else {
                e.setBaseFee(dto.getBaseFee());
                e.setGstAmount(dto.getGstAmount());
                e.setTotalFee(dto.getTotalFee());
            }
        } else {
            e.setCourseName(dto.getCourseName());
            e.setBaseFee(dto.getBaseFee());
            e.setGstAmount(dto.getGstAmount());
            e.setTotalFee(dto.getTotalFee());
        }

        if (dto.getBatchId() != null) {
            Batch b = batchRepo.findById(dto.getBatchId()).orElse(null);
            e.setBatch(b);
            e.setBatchName(b != null ? b.getBatchName() : dto.getBatchName());
        } else {
            e.setBatchName(dto.getBatchName());
        }

        e.setPaidAmount(dto.getPaidAmount() != null ? dto.getPaidAmount() : 0.0);
        e.setFeeStatus(dto.getFeeStatus() != null ? dto.getFeeStatus() : "Pending");
        e.setPaymentMode(dto.getPaymentMode());
        e.setEnrolledDate(dto.getEnrolledDate() != null ? dto.getEnrolledDate() : LocalDate.now());
        e.setStatus(dto.getStatus() != null ? dto.getStatus() : "Active");

        return toDTO(enrollmentRepo.save(e));
    }

    public EnrollmentDTO update(Long id, EnrollmentDTO dto) {
        Enrollment e = enrollmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found: " + id));

        e.setFeeStatus(dto.getFeeStatus());
        e.setPaidAmount(dto.getPaidAmount());
        e.setPaymentMode(dto.getPaymentMode());
        e.setStatus(dto.getStatus());

        if (dto.getCourseId() != null && (e.getCourse() == null || !e.getCourse().getId().equals(dto.getCourseId()))) {
            Course c = courseRepo.findById(dto.getCourseId()).orElse(null);
            if (c != null) {
                e.setCourse(c);
                e.setCourseName(c.getCourseName());
                double base = c.getFee() != null ? c.getFee() : 0;
                double gst  = Math.round(base * GST_RATE * 100.0) / 100.0;
                e.setBaseFee(base);
                e.setGstAmount(gst);
                e.setTotalFee(Math.round((base + gst) * 100.0) / 100.0);
            }
        }

        return toDTO(enrollmentRepo.save(e));
    }

    public void delete(Long id) {
        enrollmentRepo.deleteById(id);
    }

    public EnrollmentDTO getReceiptData(Long id) {
        return getById(id);
    }

    private EnrollmentDTO toDTO(Enrollment e) {
        return EnrollmentDTO.builder()
                .id(e.getId())
                .studentId(e.getStudent()  != null ? e.getStudent().getId()  : null)
                .courseId( e.getCourse()   != null ? e.getCourse().getId()   : null)
                .batchId(  e.getBatch()    != null ? e.getBatch().getId()    : null)
                .studentName(e.getStudentName())
                .courseName( e.getCourseName())
                .batchName(  e.getBatchName())
                .baseFee(   e.getBaseFee())
                .gstAmount( e.getGstAmount())
                .totalFee(  e.getTotalFee())
                .paidAmount(e.getPaidAmount())
                .feeStatus( e.getFeeStatus())
                .paymentMode(e.getPaymentMode())
                .enrolledDate(e.getEnrolledDate())
                .status(e.getStatus())
                .build();
    }
}

