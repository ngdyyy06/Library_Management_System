package com.library.management.controller;

import com.library.management.dto.CreateBookCopyRequest;
import com.library.management.entity.BookCopy;
import com.library.management.service.BookCopyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book-copies")
public class BookCopyController {

    private final BookCopyService bookCopyService;

    public BookCopyController(BookCopyService bookCopyService) {
        this.bookCopyService = bookCopyService;
    }

    @PostMapping
    public BookCopy createBookCopy(
            @Valid @RequestBody CreateBookCopyRequest request) {

        return bookCopyService.createBookCopy(request);
    }

    @GetMapping
    public List<BookCopy> getAllBookCopies() {
        return bookCopyService.getAllBookCopies();
    }

    @GetMapping("/{id}")
    public BookCopy getBookCopyById(@PathVariable Long id) {
        return bookCopyService.getBookCopyById(id);
    }

    @PatchMapping("/{id}/lost")
    public BookCopy markAsLost(@PathVariable Long id) {
        return bookCopyService.markAsLost(id);
    }

    @PatchMapping("/{id}damaged")
    public BookCopy markAsDamaged(@PathVariable Long id) {
        return bookCopyService.markAsDamaged(id);
    }

    @PatchMapping("/{id}/remove")
    public BookCopy removeBookCopy(@PathVariable Long id) {
        return bookCopyService.removeBookCopy(id);
    }
}