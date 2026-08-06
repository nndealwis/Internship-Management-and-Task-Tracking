package com.nimesh.internship_management.service;

import com.nimesh.internship_management.model.Project;
import com.nimesh.internship_management.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id).orElse(null);
    }

    public Project createProject(Project project) {
        return projectRepository.save(project);
    }

    public Project updateProject(String id, Project project) {

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
        projectRepository.deleteById(id);
    }
}