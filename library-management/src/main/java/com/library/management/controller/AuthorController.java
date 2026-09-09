package com.library.management.controller;

import com.library.management.entity.Author;
import com.library.management.service.AuthorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @PostMapping
    public Author createAuthor(@RequestBody Author author) {
        return authorService.createAuthor(author);
    }

    @GetMapping
    public List<Author> getAllAuthors() {
        return authorService.getAllAuthors();
    }

    @GetMapping("/{id}")
    public Author getAuthorById(@PathVariable Long id) {
        return authorService.getAuthorById(id);
    }

    @PutMapping("/{id}")
    public Author updateAuthor(
            @PathVariable Long id,
            @RequestBody Author author) {

        return authorService.updateAuthor(id, author);
    }

    @PatchMapping("/{id}/deactivate")
    public Author deactivateAuthor(@PathVariable Long id) {
        return authorService.deactivateAuthor(id);
    }

    @PatchMapping("/{id}/activate")
    public Author activateAuthor(@PathVariable Long id) {
        return authorService.activateAuthor(id);
    }
}