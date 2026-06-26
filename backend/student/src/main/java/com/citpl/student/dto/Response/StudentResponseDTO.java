package com.citpl.student.dto.Response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponseDTO {

    private Long id;
    private String name;
    private String email;
    private Integer age;
    private String studentCode;
    private String city;
    private String status;

    // Flattened batch info
    private Long batchId;
    private String batchName;
}