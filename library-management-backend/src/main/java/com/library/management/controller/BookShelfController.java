package com.library.management.controller;

import com.library.management.dto.BookShelfDetailResponse;
import com.library.management.dto.BookShelfListResponse;
import com.library.management.entity.BookShelf;
import com.library.management.service.BookShelfService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book-shelves")
public class BookShelfController {

    private final BookShelfService bookShelfService;

    public BookShelfController(BookShelfService bookShelfService) {
        this.bookShelfService = bookShelfService;
    }

    @GetMapping
    public ResponseEntity<List<BookShelfListResponse>> getAllShelves() {

        return ResponseEntity.ok(
                bookShelfService.getAllShelves()
        );
    }

    @PostMapping
    public ResponseEntity<BookShelf> createShelf(
            @RequestBody BookShelf shelf
    ) {

        return ResponseEntity.ok(
                bookShelfService.createShelf(shelf)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookShelf> getShelfById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                bookShelfService.getShelfById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookShelf> updateShelf(
            @PathVariable Long id,
            @RequestBody BookShelf shelf
    ) {

        return ResponseEntity.ok(
                bookShelfService.updateShelf(id, shelf)
        );
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<BookShelf> deactivateShelf(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                bookShelfService.deactivateShelf(id)
        );
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<BookShelf> activateShelf(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                bookShelfService.activateShelf(id)
        );
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<BookShelfDetailResponse> getShelfDetail(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                bookShelfService.getShelfDetail(id)
        );
    }
}