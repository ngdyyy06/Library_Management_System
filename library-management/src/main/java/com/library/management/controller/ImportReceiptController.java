package com.library.management.controller;

import com.library.management.dto.CreateImportReceiptRequest;
import com.library.management.entity.ImportReceipt;
import com.library.management.entity.ImportReceiptDetail;
import com.library.management.entity.User;
import com.library.management.repository.ImportReceiptDetailRepository;
import com.library.management.repository.UserRepository;
import com.library.management.service.ImportReceiptService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/import-receipts")
public class ImportReceiptController {

    private final ImportReceiptService importReceiptService;
    private final UserRepository userRepository;
    private final ImportReceiptDetailRepository importReceiptDetailRepository;

    public ImportReceiptController(
            ImportReceiptService importReceiptService,
            UserRepository userRepository,
            ImportReceiptDetailRepository importReceiptDetailRepository) {

        this.importReceiptService = importReceiptService;
        this.userRepository = userRepository;
        this.importReceiptDetailRepository = importReceiptDetailRepository;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ImportReceipt createImportReceipt(
            @Valid @RequestBody CreateImportReceiptRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return importReceiptService.createImportReceipt(
                request,
                user.getId()
        );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public List<ImportReceipt> getAllImportReceipts() {

        return importReceiptService.getAllImportReceipts();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ImportReceipt getImportReceiptById(
            @PathVariable Long id) {

        return importReceiptService.getImportReceiptById(id);
    }

    // =========================================================
    // GET DETAILS
    // =========================================================

    @GetMapping("/{id}/details")
    public List<ImportReceiptDetail> getImportReceiptDetails(
            @PathVariable Long id) {

        return importReceiptDetailRepository
                .findByImportReceiptId(id);
    }

    // =========================================================
    // UPDATE / EDIT
    // =========================================================

    @PutMapping("/{id}")
    public ImportReceipt updateImportReceipt(
            @PathVariable Long id,
            @Valid @RequestBody CreateImportReceiptRequest request) {

        return importReceiptService.updateImportReceipt(
                id,
                request
        );
    }

    // =========================================================
    // DEACTIVATE
    // =========================================================

    @PatchMapping("/{id}/deactivate")
    public ImportReceipt deactivateImportReceipt(
            @PathVariable Long id) {

        return importReceiptService.deactivateImportReceipt(id);
    }

    // =========================================================
    // ACTIVATE
    // =========================================================

    @PatchMapping("/{id}/activate")
    public ImportReceipt activateImportReceipt(
            @PathVariable Long id) {

        return importReceiptService.activateImportReceipt(id);
    }
}