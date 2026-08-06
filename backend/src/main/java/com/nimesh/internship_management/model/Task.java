package com.nimesh.internship_management.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Assigned Intern ID is required")
    private String assignedInternId;

    @NotNull(message = "Priority is required")
    private Priority priority;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    private List<Feedback> feedback;
}
