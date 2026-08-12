package com.nimesh.internship_management.service;

import com.nimesh.internship_management.exception.ForbiddenException;
import com.nimesh.internship_management.model.Project;
import com.nimesh.internship_management.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AuthUserService authUserService;

    public ProjectService(ProjectRepository projectRepository, AuthUserService authUserService) {
        this.projectRepository = projectRepository;
        this.authUserService = authUserService;
    }

    public List<Project> getAllProjects() {
        if (authUserService.isAdmin()) {
            return projectRepository.findAll();
        }
        String userId = authUserService.getCurrentUserId();
        if (userId == null) {
            throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
        }
        return projectRepository.findByAssignedInternIdsContaining(userId);
    }

    public Project getProjectById(String id) {
        Project project = projectRepository.findById(id).orElse(null);
        if (project == null) return null;

        if (authUserService.isIntern()) {
            String userId = authUserService.getCurrentUserId();
            if (userId == null) {
                throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
            }
            if (project.getAssignedInternIds() == null ||
                    !project.getAssignedInternIds().contains(userId)) {
                throw new ForbiddenException("You are not assigned to this project");
            }
        }
        return project;
    }

    public Project createProject(Project project) {
        requireAdmin();
        return projectRepository.save(project);
    }

    public Project updateProject(String id, Project project) {
        requireAdmin();
        Project existingProject = projectRepository.findById(id).orElse(null);

        if (existingProject == null) {
            return null;
        }

        existingProject.setTitle(project.getTitle());
        existingProject.setDescription(project.getDescription());
        existingProject.setTechnology(project.getTechnology());
        existingProject.setDeadline(project.getDeadline());
        existingProject.setStatus(project.getStatus());
        existingProject.setAssignedInternIds(project.getAssignedInternIds());

        return projectRepository.save(existingProject);
    }

    public void deleteProject(String id) {
        requireAdmin();
        projectRepository.deleteById(id);
    }

    private void requireAdmin() {
        if (!authUserService.isAdmin()) {
            throw new ForbiddenException("Only administrators can perform this action");
        }
    }
}
