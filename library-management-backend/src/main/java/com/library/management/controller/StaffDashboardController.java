package com.library.management.controller;

import com.library.management.dto.StaffDashboardResponse;
import com.library.management.service.StaffDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/dashboard")
public class StaffDashboardController {

    private final StaffDashboardService staffDashboardService;

    public StaffDashboardController(
            StaffDashboardService staffDashboardService) {
        this.staffDashboardService = staffDashboardService;
    }

    @GetMapping
    public StaffDashboardResponse getDashboard() {
        return staffDashboardService.getDashboard();
    }
}