package com.citpl.student.service;

import com.citpl.student.model.*;
import com.citpl.student.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ImportService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final InstructorRepository instructorRepository;

    // ─── STUDENT IMPORT ──────────────────────────────────────────────────

    public int importStudents(MultipartFile file) throws IOException {
        List<Student> students = new ArrayList<>();
        String filename = file.getOriginalFilename();

        if (filename != null && filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
                CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim().parse(reader);
                for (CSVRecord r : parser) {
                    students.add(buildStudent(r.get("name"), r.get("email"),
                        safeInt(r.isMapped("age") ? r.get("age") : ""),
                        r.isMapped("studentCode") ? r.get("studentCode") : "",
                        r.isMapped("city") ? r.get("city") : ""));
                }
            }
        } else {
            try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;
                    students.add(buildStudent(
                        getCellString(row, 0), getCellString(row, 1),
                        (int) getNumericCell(row, 2),
                        getCellString(row, 3), getCellString(row, 4)));
                }
            }
        }
        studentRepository.saveAll(students);
        return students.size();
    }

    private Student buildStudent(String name, String email, int age, String code, String city) {
        Student s = new Student();
        s.setName(name);
        s.setEmail(email);
        s.setAge(age);
        s.setStudentCode(code.isBlank() ? "STU" + System.currentTimeMillis() : code);
        s.setCity(city);
        s.setStatus(Status.ACTIVE);
        return s;
    }

    // ─── COURSE IMPORT ───────────────────────────────────────────────────

    public int importCourses(MultipartFile file) throws IOException {
        List<Course> courses = new ArrayList<>();
        String filename = file.getOriginalFilename();

        if (filename != null && filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
                CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim().parse(reader);
                for (CSVRecord r : parser) {
                    courses.add(buildCourse(r.get("courseName"), r.get("courseCode"),
                        r.isMapped("department") ? r.get("department") : "",
                        r.isMapped("duration") ? r.get("duration") : ""));
                }
            }
        } else {
            try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;
                    courses.add(buildCourse(getCellString(row, 0), getCellString(row, 1),
                        getCellString(row, 2), getCellString(row, 3)));
                }
            }
        }
        courseRepository.saveAll(courses);
        return courses.size();
    }

    private Course buildCourse(String name, String code, String dept, String duration) {
        Course c = new Course();
        c.setCourseName(name);
        c.setCourseCode(code.isBlank() ? "CRS" + System.currentTimeMillis() : code);
        c.setDepartment(dept);
        c.setDuration(duration);
        c.setStatus(Status.ACTIVE);
        return c;
    }

    // ─── BATCH IMPORT ────────────────────────────────────────────────────

    public int importBatches(MultipartFile file) throws IOException {
        List<Batch> batches = new ArrayList<>();
        String filename = file.getOriginalFilename();

        if (filename != null && filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
                CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim().parse(reader);
                for (CSVRecord r : parser) {
                    batches.add(buildBatch(r.get("batchName"), r.get("batchCode")));
                }
            }
        } else {
            try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;
                    batches.add(buildBatch(getCellString(row, 0), getCellString(row, 1)));
                }
            }
        }
        batchRepository.saveAll(batches);
        return batches.size();
    }

    private Batch buildBatch(String name, String code) {
        Batch b = new Batch();
        b.setBatchName(name);
        b.setBatchCode(code.isBlank() ? "BAT" + System.currentTimeMillis() : code);
        b.setStatus(Status.ACTIVE);
        return b;
    }

    // ─── INSTRUCTOR IMPORT ───────────────────────────────────────────────

    public int importInstructors(MultipartFile file) throws IOException {
        List<Instructor> instructors = new ArrayList<>();
        String filename = file.getOriginalFilename();

        if (filename != null && filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
                CSVParser parser = CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim().parse(reader);
                for (CSVRecord r : parser) {
                    instructors.add(buildInstructor(r.get("name"), r.get("email"),
                        r.isMapped("phone") ? r.get("phone") : "",
                        r.isMapped("specialization") ? r.get("specialization") : ""));
                }
            }
        } else {
            try (XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;
                    instructors.add(buildInstructor(getCellString(row, 0), getCellString(row, 1),
                        getCellString(row, 2), getCellString(row, 3)));
                }
            }
        }
        instructorRepository.saveAll(instructors);
        return instructors.size();
    }

    private Instructor buildInstructor(String name, String email, String phone, String spec) {
        Instructor ins = new Instructor();
        ins.setName(name);
        ins.setEmail(email);
        ins.setPhone(phone);
        ins.setSpecialization(spec);
        ins.setStatus(Status.ACTIVE);
        return ins;
    }

    // ─── CELL HELPERS ────────────────────────────────────────────────────

    private String getCellString(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private double getNumericCell(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) return 0;
        if (cell.getCellType() == CellType.NUMERIC) return cell.getNumericCellValue();
        try { return Double.parseDouble(cell.getStringCellValue()); } catch (Exception e) { return 0; }
    }

    private int safeInt(String val) {
        try { return Integer.parseInt(val.trim()); } catch (Exception e) { return 0; }
    }
}