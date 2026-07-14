package com.citpl.student.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of(
                    "http://localhost:5173",
                    "http://localhost:5174",
                    "http://localhost:3000",
                    "http://localhost:8080"
                ));
                config.setAllowedMethods(List.of(
                    "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
                ));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                return config;
            }))
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/admin/register",
                    "/api/admin/login",
                    "/api/auth/login",
                    "/api/auth/register/**",
                    "/swagger-ui/**",        // ✅
                    "/swagger-ui.html",      // ✅
                    "/v3/api-docs/**",       // ✅
                    "/webjars/**",           // ✅ added
                    "/swagger-resources/**"  // ✅ added
                ).permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/students/**").hasRole("ADMIN")
                .requestMatchers("/api/courses/**").hasRole("ADMIN")
                .requestMatchers("/api/batches/**").hasRole("ADMIN")
                .requestMatchers("/api/instructors/**").hasRole("ADMIN")
                .requestMatchers("/api/enrollments/**").hasRole("ADMIN")
                .requestMatchers("/api/student/me", "/api/student/me/**").hasRole("STUDENT")
                .requestMatchers("/api/student-assignment/**").hasRole("STUDENT")
                .requestMatchers("/api/instructor/me", "/api/instructor/me/**").hasRole("INSTRUCTOR")
                .anyRequest().authenticated()
            )

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class)

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}