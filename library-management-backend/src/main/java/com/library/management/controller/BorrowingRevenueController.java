package com.library.management.controller;

import com.library.management.dto.BorrowingRevenueResponse;
import com.library.management.service.BorrowingRevenueService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/borrowings")
public class BorrowingRevenueController {

    private final BorrowingRevenueService borrowingRevenueService;

    public BorrowingRevenueController(
            BorrowingRevenueService borrowingRevenueService) {

        this.borrowingRevenueService = borrowingRevenueService;
    }

    @GetMapping("/revenue")
    public BorrowingRevenueResponse getRevenue() {

        return borrowingRevenueService.getRevenue();
    }
}