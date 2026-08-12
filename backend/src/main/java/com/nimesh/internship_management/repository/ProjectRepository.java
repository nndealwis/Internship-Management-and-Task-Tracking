package com.nimesh.internship_management.repository;

import com.nimesh.internship_management.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {

    List<Project> findByAssignedInternIdsContaining(String internId);
}