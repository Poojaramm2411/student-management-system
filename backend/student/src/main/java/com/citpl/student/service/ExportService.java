package com.citpl.student.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import com.citpl.student.model.*;
import com.citpl.student.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final BatchRepository batchRepository;
    private final InstructorRepository instructorRepository;

    // ─── STUDENTS ────────────────────────────────────────────────────────

    public byte[] exportStudentsToExcel() throws Exception {
        List<Student> students = studentRepository.findAll();
        String[] headers = { "Id", "Name", "Email", "Age", "Student Code", "City", "Batch", "Status" };

        return toExcel("Students", headers, students, (row, s) -> {
            setCell(row, 0, s.getId());
            setCell(row, 1, s.getName());
            setCell(row, 2, s.getEmail());
            setCell(row, 3, s.getAge());
            setCell(row, 4, s.getStudentCode());
            setCell(row, 5, s.getCity());
            setCell(row, 6, s.getBatch() != null ? s.getBatch().getBatchCode() : "");
            setCell(row, 7, s.getStatus() != null ? s.getStatus().name() : "");
        });
    }

    public byte[] exportStudentsToPdf() throws Exception {
        List<Student> students = studentRepository.findAll();
        String[] headers = { "Id", "Name", "Email", "Age", "Student Code", "City", "Batch", "Status" };

        return toPdf("Students", headers, students, (table, s) -> {
            addCell(table, String.valueOf(s.getId()));
            addCell(table, nvl(s.getName()));
            addCell(table, nvl(s.getEmail()));
            addCell(table, s.getAge() != null ? String.valueOf(s.getAge()) : "");
            addCell(table, nvl(s.getStudentCode()));
            addCell(table, nvl(s.getCity()));
            addCell(table, s.getBatch() != null ? nvl(s.getBatch().getBatchCode()) : "");
            addCell(table, s.getStatus() != null ? s.getStatus().name() : "");
        });
    }

    // ─── COURSES ─────────────────────────────────────────────────────────

    public byte[] exportCoursesToExcel() throws Exception {
        List<Course> courses = courseRepository.findAll();
        String[] headers = { "Id", "Course Name", "Course Code", "Duration", "Fee", "Status" };

        return toExcel("Courses", headers, courses, (row, c) -> {
            setCell(row, 0, c.getId());
            setCell(row, 1, c.getCourseName());
            setCell(row, 2, c.getCourseCode());
            setCell(row, 3, c.getDuration());
            setCell(row, 4, c.getFee());
            setCell(row, 5, c.getStatus() != null ? c.getStatus().name() : "");
        });
    }

    public byte[] exportCoursesToPdf() throws Exception {
        List<Course> courses = courseRepository.findAll();
        String[] headers = { "Id", "Course Name", "Course Code", "Duration", "Fee", "Status" };

        return toPdf("Courses", headers, courses, (table, c) -> {
            addCell(table, String.valueOf(c.getId()));
            addCell(table, nvl(c.getCourseName()));
            addCell(table, nvl(c.getCourseCode()));
            addCell(table, nvl(c.getDuration()));
            addCell(table, c.getFee() != null ? String.valueOf(c.getFee()) : "");
            addCell(table, c.getStatus() != null ? c.getStatus().name() : "");
        });
    }

    // ─── BATCHES ─────────────────────────────────────────────────────────

    public byte[] exportBatchesToExcel() throws Exception {
        List<Batch> batches = batchRepository.findAll();
        String[] headers = { "Id", "Batch Name", "Batch Code", "Course", "Start Date", "End Date", "Status" };

        return toExcel("Batches", headers, batches, (row, b) -> {
            setCell(row, 0, b.getId());
            setCell(row, 1, b.getBatchName());
            setCell(row, 2, b.getBatchCode());
            setCell(row, 3, b.getCourse() != null ? b.getCourse().getCourseName() : "");
            setCell(row, 4, b.getStartDate() != null ? b.getStartDate().toString() : "");
            setCell(row, 5, b.getEndDate() != null ? b.getEndDate().toString() : "");
            setCell(row, 6, b.getStatus() != null ? b.getStatus().name() : "");
        });
    }

    public byte[] exportBatchesToPdf() throws Exception {
        List<Batch> batches = batchRepository.findAll();
        String[] headers = { "Id", "Batch Name", "Batch Code", "Course", "Start Date", "End Date", "Status" };

        return toPdf("Batches", headers, batches, (table, b) -> {
            addCell(table, String.valueOf(b.getId()));
            addCell(table, nvl(b.getBatchName()));
            addCell(table, nvl(b.getBatchCode()));
            addCell(table, b.getCourse() != null ? nvl(b.getCourse().getCourseName()) : "");
            addCell(table, b.getStartDate() != null ? b.getStartDate().toString() : "");
            addCell(table, b.getEndDate() != null ? b.getEndDate().toString() : "");
            addCell(table, b.getStatus() != null ? b.getStatus().name() : "");
        });
    }

    // ─── INSTRUCTORS ─────────────────────────────────────────────────────

    public byte[] exportInstructorsToExcel() throws Exception {
        List<Instructor> instructors = instructorRepository.findAll();
        String[] headers = { "Id", "Name", "Email", "Phone", "Specialization", "Status" };

        return toExcel("Instructors", headers, instructors, (row, ins) -> {
            setCell(row, 0, ins.getId());
            setCell(row, 1, ins.getName());
            setCell(row, 2, ins.getEmail());
            setCell(row, 3, ins.getPhone());
            setCell(row, 4, ins.getSpecialization());
            setCell(row, 5, ins.getStatus() != null ? ins.getStatus().name() : "");
        });
    }

    public byte[] exportInstructorsToPdf() throws Exception {
        List<Instructor> instructors = instructorRepository.findAll();
        String[] headers = { "Id", "Name", "Email", "Phone", "Specialization", "Status" };

        return toPdf("Instructors", headers, instructors, (table, ins) -> {
            addCell(table, String.valueOf(ins.getId()));
            addCell(table, nvl(ins.getName()));
            addCell(table, nvl(ins.getEmail()));
            addCell(table, nvl(ins.getPhone()));
            addCell(table, nvl(ins.getSpecialization()));
            addCell(table, ins.getStatus() != null ? ins.getStatus().name() : "");
        });
    }

    // ─── EXCEL HELPERS (Apache POI) ──────────────────────────────────────

    @FunctionalInterface
    private interface RowFiller<T> {
        void fill(Row row, T item);
    }

    private <T> byte[] toExcel(String sheetName, String[] headers, List<T> items, RowFiller<T> filler) throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sheetName);

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (T item : items) {
                Row row = sheet.createRow(rowIdx++);
                filler.fill(row, item);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void setCell(Row row, int col, Object value) {
        Cell cell = row.createCell(col);
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number n) {
            cell.setCellValue(n.doubleValue());
        } else {
            cell.setCellValue(value.toString());
        }
    }

    // ─── PDF HELPERS (iText 5) ───────────────────────────────────────────

    @FunctionalInterface
    private interface PdfRowFiller<T> {
        void fill(PdfPTable table, T item);
    }

    private <T> byte[] toPdf(String title, String[] headers, List<T> items, PdfRowFiller<T> filler) throws Exception {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 30, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 16, com.itextpdf.text.Font.BOLD);
        Paragraph heading = new Paragraph(title + " Report", titleFont);
        heading.setSpacingAfter(12);
        document.add(heading);

        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);

        com.itextpdf.text.Font headerFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.BOLD, BaseColor.WHITE);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
            cell.setBackgroundColor(new BaseColor(21, 101, 192));
            cell.setPadding(6);
            table.addCell(cell);
        }

        for (T item : items) {
            filler.fill(table, item);
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    private void addCell(PdfPTable table, String value) {
        com.itextpdf.text.Font cellFont = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 9);
        PdfPCell cell = new PdfPCell(new Phrase(value == null ? "" : value, cellFont));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private String nvl(String s) {
        return s == null ? "" : s;
    }
}