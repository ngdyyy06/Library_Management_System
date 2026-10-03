package com.library.management.controller;

import com.library.management.dto.ReaderRevenueResponse;
import com.library.management.service.ReaderRevenueService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/readers/revenue")
public class ReaderRevenueController {

    private final ReaderRevenueService readerRevenueService;

    public ReaderRevenueController(
            ReaderRevenueService readerRevenueService) {

        this.readerRevenueService =
                readerRevenueService;
    }

    @GetMapping
    public ReaderRevenueResponse getRevenue() {

        return readerRevenueService.getRevenue();
    }
}