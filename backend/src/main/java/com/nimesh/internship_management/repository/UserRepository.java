package com.nimesh.internship_management.repository;

import com.nimesh.internship_management.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

}