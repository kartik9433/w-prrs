package com.wprrs.controller;

import com.wprrs.dto.AuthResponse;
import com.wprrs.dto.LoginRequest;
import com.wprrs.dto.RegisterRequest;
import com.wprrs.entity.User;
import com.wprrs.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        User user = authService.getCurrentAuthenticatedUser();
        AuthResponse response = new AuthResponse(
            null,
            user.getUserId(),
            user.getEmail(),
            user.getFirstName() + " " + user.getLastName(),
            user.getRole(),
            user.getProfilePicture()
        );
        return ResponseEntity.ok(response);
    }
}
