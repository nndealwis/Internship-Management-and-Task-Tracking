package com.nimesh.internship_management.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "worklogs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkLog {

    @Id
    private String id;

    @NotBlank(message = "Intern ID is required")
    private String internId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Completed work is required")
    private String completedWork;

    private String currentWork;

    private String challenges;

    @NotNull(message = "Hours worked is required")
    @Min(value = 1, message = "Hours worked must be greater than zero")
    private double hoursWorked;

    private String nextDayPlan;
}
