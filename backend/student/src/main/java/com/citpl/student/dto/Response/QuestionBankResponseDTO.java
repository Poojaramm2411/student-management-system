package com.citpl.student.dto.Response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBankResponseDTO {
    private Long id;
    private Integer questionSet;
    private Integer questionOrder;
    private String questionText;
    private List<String> options;
    private String correctOption;
}
