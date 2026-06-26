package com.citpl.student.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Converter
public class DateConverter implements AttributeConverter<LocalDate, String> {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    @Override
    public String convertToDatabaseColumn(LocalDate date) {
        return date != null ? date.format(FMT) : null;
    }

    @Override
    public LocalDate convertToEntityAttribute(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value, FMT);
        } catch (Exception e) {
            try {
                return LocalDate.parse(value); // fallback: yyyy-MM-dd
            } catch (Exception ex) {
                return null;
            }
        }
    }
}