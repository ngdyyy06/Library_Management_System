package com.library.management.controller;

import com.library.management.entity.LibraryCard;
import com.library.management.service.LibraryCardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/library-cards")
public class LibraryCardController {

    private final LibraryCardService libraryCardService;

    public LibraryCardController(LibraryCardService libraryCardService) {
        this.libraryCardService = libraryCardService;
    }

    @PostMapping("/reader/{readerId}")
    public ResponseEntity<LibraryCard> createCard(
            @PathVariable Long readerId
    ) {
        return ResponseEntity.ok(
                libraryCardService.createCard(readerId)
        );
    }

    @GetMapping("/reader/{readerId}")
    public ResponseEntity<LibraryCard> getByReaderId(
            @PathVariable Long readerId
    ) {
        return ResponseEntity.ok(
                libraryCardService.getByReaderId(readerId)
        );
    }

    @GetMapping("/{cardNumber}")
    public ResponseEntity<LibraryCard> getByCardNumber(
            @PathVariable String cardNumber
    ) {
        return ResponseEntity.ok(
                libraryCardService.getByCardNumber(cardNumber)
        );
    }
}