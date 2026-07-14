package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "question_bank")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @Column(name = "question_set", nullable = false)
    private Integer questionSet;

    @Column(name = "question_order", nullable = false)
    private Integer questionOrder;

    @Lob
    @Column(name = "encrypted_question", columnDefinition = "TEXT", nullable = false)
    private String encryptedQuestion;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
