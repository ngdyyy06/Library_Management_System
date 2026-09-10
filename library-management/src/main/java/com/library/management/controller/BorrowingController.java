package com.library.management.controller;

import com.library.management.entity.Borrowing;
import com.library.management.service.BorrowingService;
import org.springframework.web.bind.annotation.*;
import com.library.management.dto.CreateBorrowingRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

@RestController  // controller này xử lí API
@RequestMapping("/api/borrowings")
public class BorrowingController {

    private final BorrowingService borrowingService;

    public BorrowingController(BorrowingService borrowingService) {
        this.borrowingService = borrowingService;
    }

    @PatchMapping("/{id}/renew")
    public Borrowing renewBorrowing(@PathVariable Long id) {
        return borrowingService.renewBorrowing(id);
    }

    @PostMapping
    public ResponseEntity<Borrowing> borrowBooks(
            @Valid @RequestBody CreateBorrowingRequest request) {

        Borrowing borrowing = borrowingService.borrowBooks(request);

        return ResponseEntity.ok(borrowing);
    }

    @PatchMapping("/update-overdue")
    public ResponseEntity<String> updateOverdueBorrowings() {
        borrowingService.updateOverdueBorrowings();
        return ResponseEntity.ok("Overdue borrowings updated");
    }
}