package com.library.management.controller;

import com.library.management.dto.CreateBookRequest;
import com.library.management.entity.Book;
import com.library.management.service.BookService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @PostMapping
    public Book createBook(
            @Valid @RequestBody CreateBookRequest request) {

        return bookService.createBook(request);
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookService.getBookById(id);
    }

    @PutMapping("/{id}")
    public Book updateBook(
            @PathVariable Long id,
            @Valid @RequestBody CreateBookRequest request) {

        return bookService.updateBook(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public Book deactivateBook(@PathVariable Long id) {
        return bookService.deactivateBook(id);
    }

    @GetMapping("/{id}/activate")
    public Book activateBook(@PathVariable Long id) {
        return bookService.activateBook(id);
    }
}