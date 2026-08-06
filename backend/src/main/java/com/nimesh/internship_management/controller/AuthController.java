package com.nimesh.internship_management.controller;

import com.nimesh.internship_management.dto.LoginRequest;
import com.nimesh.internship_management.dto.LoginResponse;
import com.nimesh.internship_management.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
