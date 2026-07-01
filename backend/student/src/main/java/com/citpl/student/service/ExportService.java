package com.citpl.student.service;

import com.citpl.student.model.*;
import com.citpl.student.repository.*;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final InstructorRepository instructorRepository;

    // ─── STUDENT EXPORTS ────────────────────────────────────────────────

    public byte[] exportStudentsToExcel() throws IOException {
        List<Student> students = studentRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Students");
            String[] headers = {"ID", "Name", "Email", "Age", "Student Code", "Batch", "City", "Status"};
            createExcelHeader(workbook, sheet, headers);
            int rowNum = 1;
            for (Student s : students) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(s.getId());
                row.createCell(1).setCellValue(s.getName());
                row.createCell(2).setCellValue(s.getEmail());
                row.createCell(3).setCellValue(s.getAge() != null ? s.getAge() : 0);
                row.createCell(4).setCellValue(s.getStudentCode());
                row.createCell(5).setCellValue(s.getBatch() != null && s.getBatch().getBatchName() != null ? s.getBatch().getBatchName() : "");
                row.createCell(6).setCellValue(s.getCity() != null ? s.getCity() : "");
                row.createCell(7).setCellValue(s.getStatus().name());
            }
            autoSizeColumns(sheet, headers.length);
            return toBytes(workbook);
        }
    }

    public byte[] exportStudentsToPdf() throws DocumentException {
        List<Student> students = studentRepository.findAll();
        String[] headers = {"ID", "Name", "Email", "Age", "Code", "Batch", "City", "Status"};
        float[] widths = {1f, 2.5f, 3f, 1f, 1.5f, 2f, 2f, 1.5f};
        PdfPTable table = createPdfTable(headers, widths);
        for (Student s : students) {
            addPdfRow(table,
                String.valueOf(s.getId()), s.getName(), s.getEmail(),
                String.valueOf(s.getAge() != null ? s.getAge() : ""),
                s.getStudentCode(),
                s.getBatch() != null && s.getBatch().getBatchName() != null ? s.getBatch().getBatchName() : "",
                s.getCity() != null ? s.getCity() : "",
                s.getStatus().name()
            );
        }
        return buildPdf("Students Report", table);
    }

    // ─── COURSE EXPORTS ─────────────────────────────────────────────────

    public byte[] exportCoursesToExcel() throws IOException {
        List<Course> courses = courseRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Courses");
            String[] headers = {"ID", "Course Name", "Code", "Department", "Duration", "Fees", "Batch", "Status"};
            createExcelHeader(workbook, sheet, headers);
            int rowNum = 1;
            for (Course c : courses) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(c.getId());
                row.createCell(1).setCellValue(c.getCourseName());
                row.createCell(2).setCellValue(c.getCourseCode());
                row.createCell(3).setCellValue(c.getDepartment() != null ? c.getDepartment() : "");
                row.createCell(4).setCellValue(c.getDuration() != null ? c.getDuration() : "");
                row.createCell(5).setCellValue(c.getFee() != null ? c.getFee() : 0.0);
                row.createCell(6).setCellValue(c.getBatchName() != null ? c.getBatchName() : "");
                row.createCell(7).setCellValue(c.getStatus().name());
            }
            autoSizeColumns(sheet, headers.length);
            return toBytes(workbook);
        }
    }

    public byte[] exportCoursesToPdf() throws DocumentException {
        List<Course> courses = courseRepository.findAll();
        String[] headers = {"ID", "Course Name", "Code", "Department", "Duration", "Fees", "Batch", "Status"};
        float[] widths = {1f, 2.5f, 1.5f, 2f, 1.5f, 1.5f, 2f, 1.5f};
        PdfPTable table = createPdfTable(headers, widths);
        for (Course c : courses) {
            addPdfRow(table,
                String.valueOf(c.getId()), c.getCourseName(), c.getCourseCode(),
                c.getDepartment() != null ? c.getDepartment() : "",
                c.getDuration() != null ? c.getDuration() : "",
                c.getFee() != null ? String.valueOf(c.getFee()) : "0.0",
                c.getBatchName() != null ? c.getBatchName() : "",
                c.getStatus().name()
            );
        }
        return buildPdf("Courses Report", table);
    }

    // ─── BATCH EXPORTS ──────────────────────────────────────────────────

    public byte[] exportBatchesToExcel() throws IOException {
        List<Batch> batches = batchRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Batches");
            String[] headers = {"ID", "Batch Name", "Batch Code", "Start Date", "End Date", "Instructor", "Status"};
            createExcelHeader(workbook, sheet, headers);
            int rowNum = 1;
            for (Batch b : batches) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(b.getId());
                row.createCell(1).setCellValue(b.getBatchName());
                row.createCell(2).setCellValue(b.getBatchCode());
                row.createCell(3).setCellValue(b.getStartDate() != null ? b.getStartDate().toString() : "");
                row.createCell(4).setCellValue(b.getEndDate() != null ? b.getEndDate().toString() : "");
                row.createCell(5).setCellValue(b.getInstructor() != null ? b.getInstructor().getName() : "");
                row.createCell(6).setCellValue(b.getStatus().name());
            }
            autoSizeColumns(sheet, headers.length);
            return toBytes(workbook);
        }
    }

    public byte[] exportBatchesToPdf() throws DocumentException {
        List<Batch> batches = batchRepository.findAll();
        String[] headers = {"ID", "Batch Name", "Code", "Start Date", "End Date", "Instructor", "Status"};
        float[] widths = {1f, 2.5f, 1.5f, 2f, 2f, 2.5f, 1.5f};
        PdfPTable table = createPdfTable(headers, widths);
        for (Batch b : batches) {
            addPdfRow(table,
                String.valueOf(b.getId()), b.getBatchName(), b.getBatchCode(),
                b.getStartDate() != null ? b.getStartDate().toString() : "",
                b.getEndDate() != null ? b.getEndDate().toString() : "",
                b.getInstructor() != null ? b.getInstructor().getName() : "",
                b.getStatus().name()
            );
        }
        return buildPdf("Batches Report", table);
    }

    // ─── INSTRUCTOR EXPORTS ──────────────────────────────────────────────

    public byte[] exportInstructorsToExcel() throws IOException {
        List<Instructor> instructors = instructorRepository.findAll();
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Instructors");
            String[] headers = {"ID", "Name", "Email", "Phone", "Specialization", "Status"};
            createExcelHeader(workbook, sheet, headers);
            int rowNum = 1;
            for (Instructor ins : instructors) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(ins.getId());
                row.createCell(1).setCellValue(ins.getName());
                row.createCell(2).setCellValue(ins.getEmail());
                row.createCell(3).setCellValue(ins.getPhone() != null ? ins.getPhone() : "");
                row.createCell(4).setCellValue(ins.getSpecialization() != null ? ins.getSpecialization() : "");
                row.createCell(5).setCellValue(ins.getStatus().name());
            }
            autoSizeColumns(sheet, headers.length);
            return toBytes(workbook);
        }
    }

    public byte[] exportInstructorsToPdf() throws DocumentException {
        List<Instructor> instructors = instructorRepository.findAll();
        String[] headers = {"ID", "Name", "Email", "Phone", "Specialization", "Status"};
        float[] widths = {1f, 2.5f, 3f, 2f, 2.5f, 1.5f};
        PdfPTable table = createPdfTable(headers, widths);
        for (Instructor ins : instructors) {
            addPdfRow(table,
                String.valueOf(ins.getId()), ins.getName(), ins.getEmail(),
                ins.getPhone() != null ? ins.getPhone() : "",
                ins.getSpecialization() != null ? ins.getSpecialization() : "",
                ins.getStatus().name()
            );
        }
        return buildPdf("Instructors Report", table);
    }

    // ─── HELPERS ────────────────────────────────────────────────────────

    private void createExcelHeader(XSSFWorkbook workbook, Sheet sheet, String[] headers) {
        CellStyle headerStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        headerStyle.setFont(font);
        headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void autoSizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) sheet.autoSizeColumn(i);
    }

    private byte[] toBytes(XSSFWorkbook workbook) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        return out.toByteArray();
    }

    private PdfPTable createPdfTable(String[] headers, float[] widths) throws DocumentException {
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);
        table.setWidths(widths);
        com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new BaseColor(37, 99, 235));
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
        return table;
    }

    private void addPdfRow(PdfPTable table, String... values) {
        com.itextpdf.text.Font rowFont = FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.BLACK);
        for (String v : values) {
            PdfPCell cell = new PdfPCell(new Phrase(v != null ? v : "", rowFont));
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_LEFT);
            table.addCell(cell);
        }
    }

    private byte[] buildPdf(String title, PdfPTable table) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, out);
        document.open();
        com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new BaseColor(37, 99, 235));
        Paragraph titlePara = new Paragraph(title, titleFont);
        titlePara.setAlignment(Element.ALIGN_CENTER);
        titlePara.setSpacingAfter(16);
        document.add(titlePara);
        document.add(table);
        document.close();
        return out.toByteArray();
    }
}