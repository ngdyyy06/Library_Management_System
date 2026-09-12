package com.library.management.service;

import com.library.management.dto.LoginRequest;
import com.library.management.dto.RegisterRequest;
import com.library.management.dto.UserResponse;
import com.library.management.entity.Role;
import com.library.management.entity.User;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.RoleRepository;
import com.library.management.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role readerRole = roleRepository.findById(3L)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reader role not found"));

        User user = new User();

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(readerRole);
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().getName(),
                savedUser.getStatus()
        );
    }

    public String login(LoginRequest request) {

        // kiểm tra tên tài khoản tồn tại
        User user = userRepository.findAll().stream()
                .filter(u -> u.getUsername().equals(request.getUsername()))
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException("Username not found"));

        boolean passwordMatches;
        if (user.getPassword().startsWith("$2a$")
                || user.getPassword().startsWith("$2b$")) {

            passwordMatches = passwordEncoder.matches(
                    request.getPassword(),
                    user.getPassword()
            );
        } else {
            passwordMatches = request.getPassword()
                    .equals(user.getPassword());

            if (passwordMatches) {
                user.setPassword(
                        passwordEncoder.encode(request.getPassword())
                );

                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            throw new RuntimeException("Incorrect password");
        }

        if ("INACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("User is inactive");
        }

        return jwtService.generateToken(user);
    }

    // phân quyền
    public String getUserRole(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return user.getRole().getName();
    }
}