package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_assignment",
       uniqueConstraints = @UniqueConstraint(columnNames = {"assignment_id", "student_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private LocalDateTime submittedAt;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;      // used when submissionType = TEXT

    private String fileUrl;      // used when submissionType = FILE

    private String linkUrl;      // used when submissionType = LINK

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    private Integer marksObtained;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Integer assignedSet;

    private String triedSets;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "graded_by")
    private Instructor gradedBy;

    private LocalDateTime gradedAt;

}