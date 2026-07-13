package com.citpl.student.dto.Response;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentResponseDTO {

    private Long id;
    private String title;
    private String description;

    private Long batchId;
    private String batchName;
    private String batchCode;

    private Long courseId;
    private String courseName;

    private Long instructorId;
    private String instructorName;

    private LocalDate assignedDate;
    private LocalDate dueDate;
    private Integer maxMarks;
    private String attachmentUrl;
    private String submissionType;
    private String status;

    // Quick-glance progress counters for the instructor's list view
    private Long totalSubmissions;
    private Long gradedSubmissions;
}