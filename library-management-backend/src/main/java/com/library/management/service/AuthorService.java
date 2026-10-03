package com.library.management.service;

import com.library.management.entity.Author;
import com.library.management.entity.Book;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.AuthorRepository;
import com.library.management.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorService {

    private final AuthorRepository authorRepository;
    private final BookRepository bookRepository;

    public AuthorService(
            AuthorRepository authorRepository,
            BookRepository bookRepository) {

        this.authorRepository = authorRepository;
        this.bookRepository = bookRepository;
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

        List<Book> books = bookRepository.findBooksByAuthorId(id);

        for (Book book : books) {
            book.setStatus("INACTIVE");
            book.setAvailableQuantity(0);
        }

        bookRepository.saveAll(books);

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

        List<Book> books = bookRepository.findBooksByAuthorId(id);

        // Kiểm tra tất cả author của Book đã ACTIVE chưa
        for (Book book : books) {

            boolean allAuthorsActive = book.getAuthors()
                    .stream()
                    .allMatch(a -> "ACTIVE".equals(a.getStatus()));

            if (allAuthorsActive) {

                book.setStatus("ACTIVE");

                book.setAvailableQuantity(
                        book.getTotalQuantity()
                );
            }
        }

        bookRepository.saveAll(books);

        return authorRepository.save(author);
    }

    public List<Book> getBooksByAuthor(Long id) {
        return bookRepository.findBooksByAuthorId(id);
    }
}