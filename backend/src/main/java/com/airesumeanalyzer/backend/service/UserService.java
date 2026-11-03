package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.AuthResponse;
import com.airesumeanalyzer.backend.dto.LoginRequest;
import com.airesumeanalyzer.backend.dto.RegisterRequest;

public interface UserService {
    AuthResponse registerUser(RegisterRequest registerRequest);
    AuthResponse loginUser(LoginRequest loginRequest);
}
