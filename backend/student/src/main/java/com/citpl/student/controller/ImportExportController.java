package com.citpl.student.controller;

import com.citpl.student.service.ExportService;
import com.citpl.student.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ImportExportController {

    private final ExportService exportService;
    private final ImportService importService;

    // ─── EXPORT ENDPOINTS ────────────────────────────────────────────────

    @GetMapping("/students/export/excel")
    public ResponseEntity<byte[]> exportStudentsExcel() throws Exception {
        return excelResponse(exportService.exportStudentsToExcel(), "students.xlsx");
    }

    @GetMapping("/students/export/pdf")
    public ResponseEntity<byte[]> exportStudentsPdf() throws Exception {
        return pdfResponse(exportService.exportStudentsToPdf(), "students.pdf");
    }

    @GetMapping("/courses/export/excel")
    public ResponseEntity<byte[]> exportCoursesExcel() throws Exception {
        return excelResponse(exportService.exportCoursesToExcel(), "courses.xlsx");
    }

    @GetMapping("/courses/export/pdf")
    public ResponseEntity<byte[]> exportCoursesPdf() throws Exception {
        return pdfResponse(exportService.exportCoursesToPdf(), "courses.pdf");
    }

    @GetMapping("/batches/export/excel")
    public ResponseEntity<byte[]> exportBatchesExcel() throws Exception {
        return excelResponse(exportService.exportBatchesToExcel(), "batches.xlsx");
    }

    @GetMapping("/batches/export/pdf")
    public ResponseEntity<byte[]> exportBatchesPdf() throws Exception {
        return pdfResponse(exportService.exportBatchesToPdf(), "batches.pdf");
    }

    @GetMapping("/instructors/export/excel")
    public ResponseEntity<byte[]> exportInstructorsExcel() throws Exception {
        return excelResponse(exportService.exportInstructorsToExcel(), "instructors.xlsx");
    }

    @GetMapping("/instructors/export/pdf")
    public ResponseEntity<byte[]> exportInstructorsPdf() throws Exception {
        return pdfResponse(exportService.exportInstructorsToPdf(), "instructors.pdf");
    }

    // ─── IMPORT ENDPOINTS ────────────────────────────────────────────────

    @PostMapping("/students/import")
    public ResponseEntity<Map<String, Object>> importStudents(@RequestParam("file") MultipartFile file) throws Exception {
        int count = importService.importStudents(file);
        return ResponseEntity.ok(Map.of("message", "Imported " + count + " students", "count", count));
    }

    @PostMapping("/courses/import")
    public ResponseEntity<Map<String, Object>> importCourses(@RequestParam("file") MultipartFile file) throws Exception {
        int count = importService.importCourses(file);
        return ResponseEntity.ok(Map.of("message", "Imported " + count + " courses", "count", count));
    }

    @PostMapping("/batches/import")
    public ResponseEntity<Map<String, Object>> importBatches(@RequestParam("file") MultipartFile file) throws Exception {
        int count = importService.importBatches(file);
        return ResponseEntity.ok(Map.of("message", "Imported " + count + " batches", "count", count));
    }

    @PostMapping("/instructors/import")
    public ResponseEntity<Map<String, Object>> importInstructors(@RequestParam("file") MultipartFile file) throws Exception {
        int count = importService.importInstructors(file);
        return ResponseEntity.ok(Map.of("message", "Imported " + count + " instructors", "count", count));
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────

    private ResponseEntity<byte[]> excelResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(data);
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .contentType(MediaType.APPLICATION_PDF)
            .body(data);
    }
}