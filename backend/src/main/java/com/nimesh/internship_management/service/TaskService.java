package com.nimesh.internship_management.service;

import com.nimesh.internship_management.model.Task;
import com.nimesh.internship_management.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(String id) {
        return taskRepository.findById(id).orElse(null);
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(String id, Task task) {

        Task existingTask = taskRepository.findById(id).orElse(null);

        if (existingTask == null) {
            return null;
        }

        existingTask.setTitle(task.getTitle());
        existingTask.setDescription(task.getDescription());
        existingTask.setProjectId(task.getProjectId());
        existingTask.setAssignedInternId(task.getAssignedInternId());
        existingTask.setPriority(task.getPriority());
        existingTask.setDeadline(task.getDeadline());
        existingTask.setStatus(task.getStatus());
        existingTask.setFeedback(task.getFeedback());

        return taskRepository.save(existingTask);
    }

    public void deleteTask(String id) {
        taskRepository.deleteById(id);
    }

    public List<Task> getTasksByProjectId(String projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> getTasksByAssignedInternId(String assignedInternId) {
        return taskRepository.findByAssignedInternId(assignedInternId);
    }
}