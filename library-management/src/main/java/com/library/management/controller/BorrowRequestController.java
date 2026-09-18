package com.library.management.controller;

import com.library.management.dto.CreateBorrowRequest;
import com.library.management.entity.BorrowRequest;
import com.library.management.service.BorrowRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow-requests")
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    public BorrowRequestController(
            BorrowRequestService borrowRequestService
    ) {
        this.borrowRequestService = borrowRequestService;
    }

    @GetMapping
    public ResponseEntity<List<BorrowRequest>> getAllRequests() {
        return ResponseEntity.ok(
                borrowRequestService.getAllRequests()
        );
    }

    @PostMapping
    public ResponseEntity<BorrowRequest> createRequest(
            @Valid @RequestBody CreateBorrowRequest request,
            Authentication authentication
    ) {

        BorrowRequest borrowRequest =
                borrowRequestService.createRequest(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(borrowRequest);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BorrowRequest>> getMyRequests(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                borrowRequestService.getMyRequests(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/my/{id}")
    public ResponseEntity<BorrowRequest> getMyRequestById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                borrowRequestService.getMyRequestById(
                        id,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowRequest> getRequestById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                borrowRequestService.getRequestById(id)
        );
    }

    @PatchMapping("/my/{id}/cancel")
    public ResponseEntity<BorrowRequest> cancelRequest(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                borrowRequestService.cancelRequest(
                        id,
                        authentication.getName()
                )
        );
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BorrowRequest> approveRequest(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                borrowRequestService.approveRequest(id)
        );
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BorrowRequest> rejectRequest(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                borrowRequestService.rejectRequest(id)
        );
    }
}