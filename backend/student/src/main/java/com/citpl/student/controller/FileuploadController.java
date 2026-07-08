package com.citpl.student.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileuploadController {

    // Folder on disk where uploaded files are stored.
    // Configure this in application.properties, e.g.: app.upload-dir=uploads
    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<Object> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }

            Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dirPath);

            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String ext = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
            String storedName = UUID.randomUUID() + ext;

            Path targetPath = dirPath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath);

            // Served as a static resource — see WebConfig resource handler for "/uploads/**"
            String fileUrl = "/uploads/" + storedName;

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "fileUrl", fileUrl,
                    "originalName", originalName
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "File upload failed: " + e.getMessage()));
        }
    }
}