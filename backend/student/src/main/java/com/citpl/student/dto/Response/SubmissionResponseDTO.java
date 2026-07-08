package com.citpl.student.dto.Response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResponseDTO {

    private Long id;

    private Long assignmentId;
    private String assignmentTitle;
    private Integer maxMarks;

    private Long studentId;
    private String studentName;

    private LocalDateTime submittedAt;
    private String content;
    private String fileUrl;
    private String linkUrl;
    private String status;

    private Integer marksObtained;
    private String feedback;
    private String gradedByName;
    private LocalDateTime gradedAt;
}