package com.citpl.student.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "instructor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Instructor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String specialization;

    // Nullable on purpose: Admin creates this record without a password.
    // The instructor later "claims" the account via the signup page, which
    // sets this field for the first time using their own email.
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    // ADDED — set by AuthService on every successful login. Powers the
    // admin-facing "recent login activity" notification feed.
    private LocalDateTime lastLoginAt;

}