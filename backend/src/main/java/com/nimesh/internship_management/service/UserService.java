package com.nimesh.internship_management.service;

import com.nimesh.internship_management.dto.UserRequest;
import com.nimesh.internship_management.dto.UserResponse;
import com.nimesh.internship_management.exception.ForbiddenException;
import com.nimesh.internship_management.model.User;
import com.nimesh.internship_management.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthUserService authUserService;
    private final FileStorageService fileStorageService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthUserService authUserService, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authUserService = authUserService;
        this.fileStorageService = fileStorageService;
    }

    public List<UserResponse> getAllUsers() {
        requireAdmin();
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    public UserResponse getUserById(String id) {
        requireAdmin();
        return userRepository.findById(id)
                .map(this::toUserResponse)
                .orElse(null);
    }

    public UserResponse createUser(UserRequest request, MultipartFile profilePhoto) {
        requireAdmin();
        User user = toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(profilePhoto);
            user.setProfileImageUrl(imageUrl);
        }

        return toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUser(String id, UserRequest request, MultipartFile profilePhoto) {
        requireAdmin();
        User existingUser = userRepository.findById(id).orElse(null);

        if (existingUser == null) {
            return null;
        }

        existingUser.setName(request.getName().trim());
        existingUser.setEmail(request.getEmail().trim().toLowerCase());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        existingUser.setRole(request.getRole());
        existingUser.setActive(request.isActive());

        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            String imageUrl = fileStorageService.storeFile(profilePhoto);
            existingUser.setProfileImageUrl(imageUrl);
        }

        return toUserResponse(userRepository.save(existingUser));
    }

    public void deleteUser(String id) {
        requireAdmin();
        User user = userRepository.findById(id).orElse(null);
        if (user != null && user.getProfileImageUrl() != null) {
            fileStorageService.deleteFile(user.getProfileImageUrl());
        }
        userRepository.deleteById(id);
    }

    private void requireAdmin() {
        if (!authUserService.isAdmin()) {
            throw new ForbiddenException("Only administrators can manage users");
        }
    }

    private User toUser(UserRequest request) {
        return User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
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
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}
