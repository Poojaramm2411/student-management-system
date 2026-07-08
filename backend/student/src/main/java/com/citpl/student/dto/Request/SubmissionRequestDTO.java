package com.citpl.student.dto.Request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionRequestDTO {

    private Long studentId;
    private String content;   // for TEXT submissions
    private String fileUrl;   // for FILE submissions (returned by the upload endpoint)
    private String linkUrl;   // for LINK submissions
}