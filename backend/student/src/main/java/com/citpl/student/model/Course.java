package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import com.citpl.student.model.Status;

@Entity
@Table(name = "course")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String courseName;
    private String courseCode;
    private String duration;

    // Fee in rupees - used for GST calculation
    @Column(name = "fee")
    private Double fee;

    // Active / Inactive
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

}