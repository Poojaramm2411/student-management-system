package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import com.citpl.student.converter.DateConverter;
import jakarta.persistence.Convert;

@Entity
@Table(name = "batch")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String batchName;

    @Column(nullable = false, unique = true)
    private String batchCode;

    @Convert(converter = DateConverter.class)
    private LocalDate startDate;

    @Convert(converter = DateConverter.class)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = true)
    private Instructor instructor;

}