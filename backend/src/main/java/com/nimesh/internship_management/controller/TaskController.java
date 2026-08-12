package com.nimesh.internship_management.controller;

import com.nimesh.internship_management.model.Feedback;
import com.nimesh.internship_management.model.Task;
import com.nimesh.internship_management.service.AuthUserService;
import com.nimesh.internship_management.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final AuthUserService authUserService;

    public TaskController(TaskService taskService, AuthUserService authUserService) {
        this.taskService = taskService;
        this.authUserService = authUserService;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable String id) {
        return taskService.getTaskById(id);
    }

    @PostMapping
    public Task createTask(@Valid @RequestBody Task task) {
        return taskService.createTask(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable String id,
                           @Valid @RequestBody Task task) {
        return taskService.updateTask(id, task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
    }

    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProjectId(@PathVariable String projectId) {
        return taskService.getTasksByProjectId(projectId);
    }

    @GetMapping("/intern/{internId}")
    public List<Task> getTasksByAssignedInternId(@PathVariable String internId) {
        return taskService.getTasksByAssignedInternId(internId);
    }

    @PostMapping("/{taskId}/feedback")
    public Task addFeedback(@PathVariable String taskId, @RequestBody Feedback feedback) {
        if (!authUserService.isAdmin()) {
            throw new com.nimesh.internship_management.exception.ForbiddenException("Only administrators can add feedback");
        }
        if (feedback.getComment() == null || feedback.getComment().trim().isEmpty()) {
            throw new com.nimesh.internship_management.exception.ForbiddenException("Feedback comment is required");
        }
        if (feedback.getDecision() == null) {
            throw new com.nimesh.internship_management.exception.ForbiddenException("Feedback decision is required");
        }
        Task task = taskService.getTaskById(taskId);
        if (task == null) {
            throw new java.util.NoSuchElementException("Task not found with id: " + taskId);
        }
        if (task.getFeedback() == null) {
            task.setFeedback(new java.util.ArrayList<>());
        }
        feedback.setDate(LocalDate.now());
        task.getFeedback().add(feedback);
        return taskService.updateTask(taskId, task);
    }

    @GetMapping("/{taskId}/feedback")
    public List<Feedback> getFeedback(@PathVariable String taskId) {
        Task task = taskService.getTaskById(taskId);
        if (task == null) {
            throw new java.util.NoSuchElementException("Task not found with id: " + taskId);
        }
        return task.getFeedback() != null ? task.getFeedback() : List.of();
    }
}
