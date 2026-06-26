package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import com.citpl.student.model.Status;

@Entity
@Table(name = "courses")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String courseName;
    private String courseCode;
    private String description;
    private String department;
    private String duration;

    // Fee in rupees - used for GST calculation
    @Column(name = "fee")
    private Double fee;

    // Batch name (denormalized for display)
    private String batchName;

    // Active / Inactive
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private Instructor instructor;
}