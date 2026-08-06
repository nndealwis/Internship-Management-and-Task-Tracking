package com.nimesh.internship_management.repository;

import com.nimesh.internship_management.model.WorkLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WorkLogRepository extends MongoRepository<WorkLog, String> {

    List<WorkLog> findByInternId(String internId);

}