package com.citpl.student.dto.Request;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequestDTO {

    private String title;
    private String description;
    private Long batchId;
    private Long instructorId;
    private LocalDate assignedDate;
    private LocalDate dueDate;
    private Integer maxMarks;
    private String attachmentUrl;
    private String submissionType;  // FILE / TEXT / LINK
    private String status;          // DRAFT / PUBLISHED / CLOSED
    private String questionsJson;
}