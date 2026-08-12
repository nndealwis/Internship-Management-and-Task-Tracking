package com.nimesh.internship_management.service;

import com.nimesh.internship_management.exception.ForbiddenException;
import com.nimesh.internship_management.model.Project;
import com.nimesh.internship_management.model.Task;
import com.nimesh.internship_management.repository.ProjectRepository;
import com.nimesh.internship_management.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final AuthUserService authUserService;

    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository, AuthUserService authUserService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.authUserService = authUserService;
    }

    public List<Task> getAllTasks() {
        if (authUserService.isAdmin()) {
            return taskRepository.findAll();
        }
        String userId = authUserService.getCurrentUserId();
        if (userId == null) {
            throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
        }
        return taskRepository.findByAssignedInternId(userId);
    }

    public Task getTaskById(String id) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task == null) return null;

        if (authUserService.isIntern()) {
            String userId = authUserService.getCurrentUserId();
            if (userId == null) {
                throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
            }
            if (!userId.equals(task.getAssignedInternId())) {
                throw new ForbiddenException("You are not assigned to this task");
            }
        }
        return task;
    }

    public Task createTask(Task task) {
        requireAdmin();
        validateInternAssignment(task.getProjectId(), task.getAssignedInternId());
        return taskRepository.save(task);
    }

    public Task updateTask(String id, Task task) {
        Task existingTask = taskRepository.findById(id).orElse(null);

        if (existingTask == null) {
            return null;
        }

        if (authUserService.isAdmin()) {
            existingTask.setTitle(task.getTitle());
            existingTask.setDescription(task.getDescription());
            existingTask.setProjectId(task.getProjectId());
            existingTask.setAssignedInternId(task.getAssignedInternId());
            existingTask.setPriority(task.getPriority());
            existingTask.setDeadline(task.getDeadline());
            existingTask.setStatus(task.getStatus());
            existingTask.setFeedback(task.getFeedback());
            validateInternAssignment(task.getProjectId(), task.getAssignedInternId());
        } else {
            String userId = authUserService.getCurrentUserId();
            if (userId == null) {
                throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
            }
            if (!userId.equals(existingTask.getAssignedInternId())) {
                throw new ForbiddenException("You can only update your own assigned tasks");
            }
            existingTask.setStatus(task.getStatus());
        }

        return taskRepository.save(existingTask);
    }

    public void deleteTask(String id) {
        requireAdmin();
        taskRepository.deleteById(id);
    }

    public List<Task> getTasksByProjectId(String projectId) {
        if (authUserService.isAdmin()) {
            return taskRepository.findByProjectId(projectId);
        }
        String userId = authUserService.getCurrentUserId();
        if (userId == null) {
            throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
        }
        return taskRepository.findByProjectId(projectId).stream()
                .filter(t -> userId.equals(t.getAssignedInternId()))
                .toList();
    }

    public List<Task> getTasksByAssignedInternId(String assignedInternId) {
        if (authUserService.isAdmin()) {
            return taskRepository.findByAssignedInternId(assignedInternId);
        }
        String userId = authUserService.getCurrentUserId();
        if (userId == null) {
            throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
        }
        if (!userId.equals(assignedInternId)) {
            throw new ForbiddenException("You can only view your own tasks");
        }
        return taskRepository.findByAssignedInternId(assignedInternId);
    }

    private void requireAdmin() {
        if (!authUserService.isAdmin()) {
            throw new ForbiddenException("Only administrators can perform this action");
        }
    }

    private void validateInternAssignment(String projectId, String internId) {
        if (projectId == null || internId == null) return;
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            throw new ForbiddenException("Project not found");
        }
        if (project.getAssignedInternIds() == null ||
                !project.getAssignedInternIds().contains(internId)) {
            throw new ForbiddenException("The assigned intern is not part of this project");
        }
    }
}
