package com.library.management.controller;

import com.library.management.dto.CreateBorrowingRequest;
import com.library.management.dto.RenewBorrowingRequest;
import com.library.management.dto.ReturnBookRequest;
import com.library.management.entity.Borrowing;
import com.library.management.entity.BorrowingDetail;
import com.library.management.entity.ReturnHistory;
import com.library.management.service.BorrowingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrowings")
public class BorrowingController {

    private final BorrowingService borrowingService;

    public BorrowingController(
            BorrowingService borrowingService) {

        this.borrowingService = borrowingService;
    }

    @PatchMapping("/{id}/renew")
    public ResponseEntity<Borrowing> renewBorrowing(
            @PathVariable Long id,
            @Valid @RequestBody RenewBorrowingRequest request) {

        Borrowing borrowing =
                borrowingService.renewBorrowing(id, request);

        return ResponseEntity.ok(borrowing);
    }

    @PostMapping
    public ResponseEntity<Borrowing> borrowBooks(
            @Valid @RequestBody CreateBorrowingRequest request) {

        Borrowing borrowing =
                borrowingService.borrowBooks(request);

        return ResponseEntity.ok(borrowing);
    }

    @PatchMapping("/details/{detailId}/return")
    public ResponseEntity<BorrowingDetail> returnBook(
            @PathVariable Long detailId,
            @Valid @RequestBody ReturnBookRequest request) {

        BorrowingDetail detail =
                borrowingService.returnBook(
                        detailId,
                        request
                );

        return ResponseEntity.ok(detail);
    }

    @PatchMapping("/update-overdue")
    public ResponseEntity<String> updateOverdueBorrowings() {

        borrowingService.updateOverdueBorrowings();

        return ResponseEntity.ok(
                "Overdue borrowings updated"
        );
    }

    @GetMapping
    public ResponseEntity<List<Borrowing>> getAllBorrowings() {

        List<Borrowing> borrowings =
                borrowingService.getAllBorrowings();

        return ResponseEntity.ok(borrowings);
    }

    @GetMapping("/return-history")
    public ResponseEntity<List<ReturnHistory>> getReturnHistory() {
        return ResponseEntity.ok(
                borrowingService.getReturnHistory()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Borrowing> getBorrowingById(
            @PathVariable Long id) {

        Borrowing borrowing =
                borrowingService.getBorrowingById(id);

        return ResponseEntity.ok(borrowing);
    }

    @GetMapping("/details/{detailId}")
    public ResponseEntity<BorrowingDetail> getBorrowingDetail(
            @PathVariable Long detailId) {

        BorrowingDetail detail =
                borrowingService.getBorrowingDetailById(detailId);

        return ResponseEntity.ok(detail);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<List<BorrowingDetail>> getBorrowingDetails(
            @PathVariable Long id) {

        List<BorrowingDetail> details =
                borrowingService.getBorrowingDetails(id);

        return ResponseEntity.ok(details);
    }
}