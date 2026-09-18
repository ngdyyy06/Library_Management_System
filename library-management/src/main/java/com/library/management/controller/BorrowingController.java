package com.library.management.controller;

import com.library.management.entity.Borrowing;
import com.library.management.entity.BorrowingDetail;
import com.library.management.service.BorrowingService;
import org.springframework.web.bind.annotation.*;
import com.library.management.dto.CreateBorrowingRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import com.library.management.dto.ReturnBookRequest;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController  // controller này xử lí API
@RequestMapping("/api/borrowings")
public class BorrowingController {

    private final BorrowingService borrowingService;

    public BorrowingController(BorrowingService borrowingService) {
        this.borrowingService = borrowingService;
    }

    @PatchMapping("/{id}/renew")
    public Borrowing renewBorrowing(
            @PathVariable Long id,
            Authentication authentication) {

        return borrowingService.renewBorrowing(
                id,
                authentication.getName()
        );
    }

    @PostMapping
    public ResponseEntity<Borrowing> borrowBooks(
            @Valid @RequestBody CreateBorrowingRequest request) {

        Borrowing borrowing = borrowingService.borrowBooks(request);

        return ResponseEntity.ok(borrowing);
    }

    @PatchMapping("/details/{detailId}/return")
    public ResponseEntity<BorrowingDetail> returnBook(
            @PathVariable Long detailId,
            @Valid @RequestBody ReturnBookRequest request) {

        return ResponseEntity.ok(
                borrowingService.returnBook(
                        detailId,
                        request.getCondition()
                )
        );
    }

    @PatchMapping("/update-overdue")
    public ResponseEntity<String> updateOverdueBorrowings() {
        borrowingService.updateOverdueBorrowings();
        return ResponseEntity.ok("Overdue borrowings updated");
    }

    @GetMapping
    public ResponseEntity<List<Borrowing>> getAllBorrowings() {
        List<Borrowing> borrowings =
                borrowingService.getAllBorrowings();

        return ResponseEntity.ok(borrowings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Borrowing> getBorrowingById(
            @PathVariable Long id) {

        Borrowing borrowing =
                borrowingService.getBorrowingById(id);

        return ResponseEntity.ok(borrowing);
    }

    // lấy 1 borrowingDetail cụ thể
    @GetMapping("/details/{detailId}")
    public ResponseEntity<BorrowingDetail> getBorrowingDetail(
            @PathVariable Long detailId) {

        BorrowingDetail detail =
                borrowingService.getBorrowingDetailById(detailId);

        return ResponseEntity.ok(detail);
    }

    // lấy tất cả borrowingDetail thuộc 1 borrowing
    @GetMapping("/{id}/details")
    public ResponseEntity<List<BorrowingDetail>> getBorrowingDetails(
            @PathVariable Long id) {

        List<BorrowingDetail> details =
                borrowingService.getBorrowingDetails(id);

        return ResponseEntity.ok(details);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Borrowing>> getMyBorrowings(
            Authentication authentication) {

        return ResponseEntity.ok(
                borrowingService.getMyBorrowings(
                        authentication.getName()
                )
        );
    }
}