package com.airesumeanalyzer.backend.service;

import com.airesumeanalyzer.backend.dto.AuthResponse;
import com.airesumeanalyzer.backend.dto.LoginRequest;
import com.airesumeanalyzer.backend.dto.RegisterRequest;
import com.airesumeanalyzer.backend.entity.Role;
import com.airesumeanalyzer.backend.entity.User;
import com.airesumeanalyzer.backend.exception.ApiException;
import com.airesumeanalyzer.backend.repository.UserRepository;
import com.airesumeanalyzer.backend.security.JwtTokenProvider;
import com.airesumeanalyzer.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        log.debug("Registering user with email: {}", registerRequest.getEmail());

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMAIL_ALREADY_IN_USE", "Email is already in use");
        }

        Role role = Role.USER;
        if (registerRequest.getRole() != null) {
            try {
                role = Role.valueOf(registerRequest.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role provided: {}, defaulting to USER", registerRequest.getRole());
            }
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        // Auto login after registration
        return loginUser(new LoginRequest() {{
            setEmail(registerRequest.getEmail());
            setPassword(registerRequest.getPassword());
        }});
    }

    @Override
    public AuthResponse loginUser(LoginRequest loginRequest) {
        log.debug("Authenticating user with email: {}", loginRequest.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtTokenProvider.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                    .orElse("USER");

            return AuthResponse.builder()
                    .token(jwt)
                    .email(userDetails.getEmail())
                    .role(role)
                    .build();
        } catch (Exception e) {
            log.error("Authentication failed: {}", e.getMessage());
            throw new ApiException(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS", "Invalid email or password");
        }
    }
}
