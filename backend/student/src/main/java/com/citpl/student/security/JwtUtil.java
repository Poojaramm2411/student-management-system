package com.citpl.student.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.citpl.student.model.Admin;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes()); 
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(
                        System.currentTimeMillis() + 864000000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) 
                .compact();
    }

    // New: embeds a role claim so the filter knows which ROLE_* to grant.
    // Used by the unified /api/auth/login for Admin, Student, and Instructor.
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(
                        System.currentTimeMillis() + 864000000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(Admin saved) {
        // now embeds the ADMIN role claim, same as Student/Instructor tokens
        return generateToken(saved.getEmail(), "ADMIN");
    }

    public String extractEmail1(String token) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'extractEmail'");
    }
    public String extractEmail(String token) {
    return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
}

    // New: reads the role claim. Returns null for older tokens minted
    // before this change (they simply had no "role" claim at all).
    public String extractRole(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role", String.class);
    }
}