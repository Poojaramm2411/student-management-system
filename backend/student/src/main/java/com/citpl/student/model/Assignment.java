package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

import com.citpl.student.converter.DateConverter;

@Entity
@Table(name = "assignment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    private Instructor instructor;

    @Convert(converter = DateConverter.class)
    private LocalDate assignedDate;

    @Convert(converter = DateConverter.class)
    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private Integer maxMarks;

    // Reference material uploaded by the instructor (optional)
    private String attachmentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionType submissionType;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status = AssignmentStatus.DRAFT;

}