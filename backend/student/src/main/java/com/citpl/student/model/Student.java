package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private Integer age;

    @Column(nullable = false, unique = true)
    private String studentCode;

    private String city;

    // Null until the student self-registers (sets their own password) via
    // /api/auth/register/student. AuthService uses this null-check to decide
    // whether the account has been "activated" yet.
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    // ADDED — set by AuthService on every successful login. Powers the
    // admin-facing "recent login activity" notification feed.
    private LocalDateTime lastLoginAt;

    // Many Students → One Batch
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;
}