package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "enrollments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studentName;
    private String courseName;
    private String batchName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    // Fee snapshot — captured at enrollment time and NEVER recalculated
    // from the live Course price afterwards. This is intentional: if a
    // course's fee changes later, past enrollments must keep showing
    // what the student was actually charged/paid.
    private Double baseFee;
    private Double gstAmount;
    private Double totalFee;
    private Double paidAmount;

    // Paid / Pending / Partial — derived server-side from paidAmount vs
    // totalFee (see EnrollmentService), never trusted directly from the client.
    @Column(name = "fee_status")
    private String feeStatus;

    private String paymentMode;
    private LocalDate enrolledDate;

    // Active / Inactive
    private String status;

    // ── Payment mode detail fields ─────────────────────────
    // Populated conditionally depending on paymentMode, matching the
    // fields collected in EnrollmentModal.jsx. All optional/nullable.
    @Column(name = "card_number")
    private String cardNumber;

    @Column(name = "upi_id")
    private String upiId;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "cheque_number")
    private String chequeNumber;
}