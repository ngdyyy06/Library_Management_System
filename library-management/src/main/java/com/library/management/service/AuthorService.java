package com.library.management.service;

import com.library.management.entity.Author;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public Author createAuthor(Author author) {
        author.setStatus("ACTIVE");
        return authorRepository.save(author);
    }

    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    public Author getAuthorById(Long id) {
        return authorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Author not found"));
    }

    public Author updateAuthor(Long id, Author author) {

        Author existingAuthor = authorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Author not found"));

        existingAuthor.setName(author.getName());
        existingAuthor.setBiography(author.getBiography());

        return authorRepository.save(existingAuthor);
    }

    public Author deactivateAuthor(Long id) {

        Author author = authorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Author not found"));

        if ("INACTIVE".equals(author.getStatus())) {
            throw new RuntimeException("Author is already inactive");
        }

        author.setStatus("INACTIVE");

        return authorRepository.save(author);
    }

    public Author activateAuthor(Long id) {

        Author author = authorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Author not found"));

        if ("ACTIVE".equals(author.getStatus())) {
            throw new RuntimeException("Author is already active");
        }

        author.setStatus("ACTIVE");

        return authorRepository.save(author);
    }
}