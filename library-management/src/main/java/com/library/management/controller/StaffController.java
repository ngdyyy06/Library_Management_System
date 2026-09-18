package com.library.management.controller;

import com.library.management.dto.UpdateStaffProfileRequest;
import com.library.management.entity.Staff;
import com.library.management.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final UserService userService;

    public StaffController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<Staff> getMyProfile(
            Authentication authentication) {

        return ResponseEntity.ok(
                userService.getMyStaffProfile(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/me")
    public ResponseEntity<Staff> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateStaffProfileRequest request) {

        return ResponseEntity.ok(
                userService.updateMyStaffProfile(
                        authentication.getName(),
                        request
                )
        );
    }
}