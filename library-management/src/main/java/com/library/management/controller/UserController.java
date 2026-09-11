package com.library.management.controller;

import com.library.management.dto.CreateUserRequest;
import com.library.management.dto.UserResponse;
import com.library.management.entity.User;
import com.library.management.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final  UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserResponse CreateUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Long id,
            @Valid @RequestBody CreateUserRequest request) {

        return userService.updateUser(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public UserResponse deactivateUser(@PathVariable Long id) {
        return userService.deactivateUser(id);
    }

    @PatchMapping("/{id}/activate")
    public UserResponse activateUser(@PathVariable Long id) {
        return userService.activateUser(id);
    }
}
