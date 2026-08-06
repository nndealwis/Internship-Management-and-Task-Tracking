package com.nimesh.internship_management.service;

import com.nimesh.internship_management.dto.UserRequest;
import com.nimesh.internship_management.dto.UserResponse;
import com.nimesh.internship_management.model.User;
import com.nimesh.internship_management.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    public UserResponse getUserById(String id) {
        return userRepository.findById(id)
                .map(this::toUserResponse)
                .orElse(null);
    }

    public UserResponse createUser(UserRequest request) {
        User user = toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUser(String id, UserRequest request) {
        User existingUser = userRepository.findById(id).orElse(null);

        if (existingUser == null) {
            return null;
        }

        existingUser.setName(request.getName());
        existingUser.setEmail(request.getEmail());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        existingUser.setRole(request.getRole());
        existingUser.setActive(request.isActive());

        return toUserResponse(userRepository.save(existingUser));
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    private User toUser(UserRequest request) {
        return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(request.getRole())
                .active(request.isActive())
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .build();
    }
}
