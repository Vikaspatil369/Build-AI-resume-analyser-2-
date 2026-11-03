package com.airesumeanalyzer.backend.controller;

import com.airesumeanalyzer.backend.dto.ApiResponse;
import com.airesumeanalyzer.backend.dto.AuthResponse;
import com.airesumeanalyzer.backend.dto.LoginRequest;
import com.airesumeanalyzer.backend.dto.RegisterRequest;
import com.airesumeanalyzer.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = userService.registerUser(registerRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = userService.loginUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }
}
