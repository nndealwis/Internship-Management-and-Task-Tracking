package com.nimesh.internship_management.repository;

import com.nimesh.internship_management.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {

    List<Task> findByProjectId(String projectId);

    List<Task> findByAssignedInternId(String assignedInternId);

}