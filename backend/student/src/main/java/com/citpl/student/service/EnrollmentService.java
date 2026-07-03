package com.citpl.student.service;

import org.springframework.stereotype.Service;

import com.citpl.student.dto.EnrollmentDTO;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Batch;
import com.citpl.student.model.Course;
import com.citpl.student.model.Enrollment;
import com.citpl.student.model.Student;
import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.CourseRepository;
import com.citpl.student.repository.EnrollmentRepository;
import com.citpl.student.repository.StudentRepository;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;

    public Page<EnrollmentDTO> getAll(String search, String feeStatus, Pageable pageable) {
        String resolvedStatus = (feeStatus != null && !feeStatus.isBlank() && !feeStatus.equalsIgnoreCase("All"))
                ? feeStatus : null;
        String resolvedSearch = (search != null && !search.isBlank()) ? search : null;
        return enrollmentRepository.searchEnrollments(resolvedSearch, resolvedStatus, pageable)
                .map(this::toDTO);
    }

    public Map<String, Long> getSummary() {
        long total   = enrollmentRepository.count();
        long paid    = enrollmentRepository.countByFeeStatus("Paid");
        long pending = enrollmentRepository.countByFeeStatus("Pending");
        long partial = enrollmentRepository.countByFeeStatus("Partial");
        return Map.of("All", total, "Paid", paid, "Pending", pending, "Partial", partial);
    }

    public List<EnrollmentDTO> getAll() {
        return enrollmentRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EnrollmentDTO getById(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + id));
        return toDTO(enrollment);
    }

    public EnrollmentDTO create(EnrollmentDTO dto) {
        if (dto.getStudentId() == null) {
            throw new ValidationException("Student is required");
        }
        if (dto.getCourseId() == null) {
            throw new ValidationException("Course is required");
        }
        if (dto.getBatchId() == null) {
            throw new ValidationException("Batch is required");
        }

        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));
        Batch batch = batchRepository.findById(dto.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + dto.getBatchId()));

        // Fee snapshot is captured HERE, at enrollment time, from the course's
        // current price. It is deliberately never re-derived later — see toDTO().
        double baseFee   = course.getFee() != null ? course.getFee() : 0.0;
        double gstAmount = round2(baseFee * 0.18);
        double totalFee  = round2(baseFee * 1.18);

        double paidAmount = dto.getPaidAmount() != null ? dto.getPaidAmount() : 0.0;
        validatePaidAmount(paidAmount, totalFee);

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .batch(batch)
                .studentName(student.getName())
                .courseName(course.getCourseName())
                .batchName(batch.getBatchName())
                .baseFee(baseFee)
                .gstAmount(gstAmount)
                .totalFee(totalFee)
                .paidAmount(paidAmount)
                .feeStatus(deriveFeeStatus(paidAmount, totalFee))
                .paymentMode(dto.getPaymentMode())
                .cardNumber(dto.getCardNumber())
                .upiId(dto.getUpiId())
                .accountNumber(dto.getAccountNumber())
                .chequeNumber(dto.getChequeNumber())
                .enrolledDate(dto.getEnrolledDate() != null ? dto.getEnrolledDate() : java.time.LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : "Active")
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        return toDTO(saved);
    }

    public EnrollmentDTO update(Long id, EnrollmentDTO dto) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + id));

        if (dto.getStudentId() != null) {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + dto.getStudentId()));
            enrollment.setStudent(student);
            enrollment.setStudentName(student.getName());
        }

        if (dto.getBatchId() != null) {
            Batch batch = batchRepository.findById(dto.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + dto.getBatchId()));
            enrollment.setBatch(batch);
            enrollment.setBatchName(batch.getBatchName());
        }

        // Fee snapshot is ONLY recalculated when the course is actually being
        // changed. Editing fee status, paid amount, payment mode, etc. must
        // never silently re-price the enrollment against the course's
        // current fee — that was the original bug.
        boolean courseChanged = dto.getCourseId() != null
                && (enrollment.getCourse() == null || !dto.getCourseId().equals(enrollment.getCourse().getId()));

        if (courseChanged) {
            Course course = courseRepository.findById(dto.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + dto.getCourseId()));
            enrollment.setCourse(course);
            enrollment.setCourseName(course.getCourseName());

            double baseFee = course.getFee() != null ? course.getFee() : 0.0;
            enrollment.setBaseFee(baseFee);
            enrollment.setGstAmount(round2(baseFee * 0.18));
            enrollment.setTotalFee(round2(baseFee * 1.18));
        }

        double totalFee = enrollment.getTotalFee() != null ? enrollment.getTotalFee() : 0.0;
        double paidAmount = dto.getPaidAmount() != null ? dto.getPaidAmount() : 0.0;
        validatePaidAmount(paidAmount, totalFee);

        enrollment.setPaidAmount(paidAmount);
        // feeStatus is always derived server-side — the client's feeStatus
        // value (e.g. from the toggle button) is intentionally ignored so
        // Paid/Pending/Partial can never drift out of sync with the amounts.
        enrollment.setFeeStatus(deriveFeeStatus(paidAmount, totalFee));
        enrollment.setPaymentMode(dto.getPaymentMode());
        enrollment.setCardNumber(dto.getCardNumber());
        enrollment.setUpiId(dto.getUpiId());
        enrollment.setAccountNumber(dto.getAccountNumber());
        enrollment.setChequeNumber(dto.getChequeNumber());
        if (dto.getEnrolledDate() != null) enrollment.setEnrolledDate(dto.getEnrolledDate());
        if (dto.getStatus() != null) enrollment.setStatus(dto.getStatus());

        Enrollment updated = enrollmentRepository.save(enrollment);
        return toDTO(updated);
    }

    public void delete(Long id) {
        if (!enrollmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Enrollment not found with id: " + id);
        }
        enrollmentRepository.deleteById(id);
    }

    public EnrollmentDTO getReceiptData(Long id) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + id));
        return toDTO(enrollment);
    }

    // ── Mapper: Entity → DTO ──────────────────────────────
    private EnrollmentDTO toDTO(Enrollment e) {
        String studentName = e.getStudent() != null ? e.getStudent().getName() : e.getStudentName();
        String courseName  = e.getCourse()  != null ? e.getCourse().getCourseName() : e.getCourseName();
        String batchName   = e.getBatch()   != null ? e.getBatch().getBatchName()   : e.getBatchName();

        // Always use the stored snapshot — never re-derive from the course's
        // current fee. This is what previously caused past enrollments to
        // change price retroactively whenever a Course's fee was edited.
        double base  = e.getBaseFee()   != null ? e.getBaseFee()   : 0.0;
        double gst   = e.getGstAmount() != null ? e.getGstAmount() : 0.0;
        double total = e.getTotalFee()  != null ? e.getTotalFee()  : 0.0;

        return EnrollmentDTO.builder()
                .id(e.getId())
                .studentId(e.getStudent() != null ? e.getStudent().getId() : null)
                .courseId(e.getCourse() != null ? e.getCourse().getId() : null)
                .batchId(e.getBatch() != null ? e.getBatch().getId() : null)
                .studentName(studentName)
                .courseName(courseName)
                .batchName(batchName)
                .baseFee(base)
                .gstAmount(gst)
                .totalFee(total)
                .paidAmount(e.getPaidAmount())
                .feeStatus(e.getFeeStatus())
                .paymentMode(e.getPaymentMode())
                .cardNumber(e.getCardNumber())
                .upiId(e.getUpiId())
                .accountNumber(e.getAccountNumber())
                .chequeNumber(e.getChequeNumber())
                .enrolledDate(e.getEnrolledDate())
                .status(e.getStatus())
                .build();
    }

    // ── Helpers ────────────────────────────────────────────

    /**
     * Derives Paid / Partial / Pending from the actual amounts instead of
     * trusting whatever feeStatus the client sends. Keeps the status badge
     * always consistent with paidAmount vs totalFee.
     */
    private String deriveFeeStatus(double paidAmount, double totalFee) {
        if (paidAmount <= 0) return "Pending";
        if (paidAmount >= totalFee) return "Paid";
        return "Partial";
    }

    private void validatePaidAmount(double paidAmount, double totalFee) {
        if (paidAmount < 0) {
            throw new ValidationException("Amount paid cannot be negative");
        }
        if (paidAmount > totalFee) {
            throw new ValidationException(
                    String.format("Amount paid (%.2f) cannot exceed total fee (%.2f)", paidAmount, totalFee));
        }
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}