package com.nimesh.internship_management.controller;

import com.nimesh.internship_management.dto.UserRequest;
import com.nimesh.internship_management.dto.UserResponse;
import com.nimesh.internship_management.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse createUser(
            @RequestPart("userData") @Valid UserRequest userRequest,
            @RequestPart(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        return userService.createUser(userRequest, profilePhoto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse updateUser(
            @PathVariable String id,
            @RequestPart("userData") @Valid UserRequest userRequest,
            @RequestPart(value = "profilePhoto", required = false) MultipartFile profilePhoto) {
        return userService.updateUser(id, userRequest, profilePhoto);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }

}
