package com.citpl.student.dto.Request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRequestDTO {

    private String name;
    private String email;
    private Integer age;
    private String studentCode;
    private String city;
    private String status;
    private Long batchId;  // FK to Batch
}