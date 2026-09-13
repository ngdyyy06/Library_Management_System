package com.library.management.service;

import com.library.management.dto.CreateBookRequest;
import com.library.management.entity.Author;
import com.library.management.entity.Book;
import com.library.management.repository.BookCopyRepository;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.AuthorRepository;
import com.library.management.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final BookCopyRepository bookCopyRepository;

    public BookService(BookRepository bookRepository, AuthorRepository authorRepository, BookCopyRepository bookCopyRepository) {
        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    public Book createBook(CreateBookRequest request) {

        // kiểm tra mã số sách đã có chưa
        if (request.getIsbn() != null
                && !request.getIsbn().isBlank()
                && bookRepository.existsByIsbn(request.getIsbn())) {

            throw new RuntimeException("ISBN already exists");
        }

        Book book = new Book();

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        book.setPublishYear(request.getPublishYear());
        book.setDescription(request.getDescription());

        book.setTotalQuantity(request.getTotalQuantity());
        book.setAvailableQuantity(request.getTotalQuantity());
        book.setStatus("ACTIVE");

        if (request.getAuthorIds() != null) {

            for (Long authorId : request.getAuthorIds()) {

                Author author = authorRepository.findById(authorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Author not found: " + authorId));

                book.getAuthors().add(author);
            }
        }

        return bookRepository.save(book);
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {

        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
    }

    public Book updateBook(Long id, CreateBookRequest request) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (bookRepository.existsByIsbn(request.getIsbn())
                && !request.getIsbn().equals(book.getIsbn())) {

            throw new RuntimeException("ISBN already exists");
        }

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        book.setPublishYear(request.getPublishYear());
        book.setDescription(request.getDescription());

        int oldTotalQuantity = book.getTotalQuantity();
        int oldAvailableQuantity = book.getAvailableQuantity();

        int borrowedQuantity = oldTotalQuantity - oldAvailableQuantity;

        int newTotalQuantity = request.getTotalQuantity();
        int newAvailableQuantity = request.getAvailableQuantity();

        if (newTotalQuantity < 0) {
            throw new RuntimeException("Total quantity cannot be negative");
        }

        if (newAvailableQuantity < 0) {
            throw new RuntimeException("Available quantity cannot be negative");
        }

        if (newAvailableQuantity > newTotalQuantity) {
            throw new RuntimeException(
                    "Available quantity cannot be greater than total quantity"
            );
        }

        if (newTotalQuantity < borrowedQuantity) {
            throw new RuntimeException(
                    "Total quantity cannot be less than borrowed quantity"
            );
        }

        book.setTotalQuantity(newTotalQuantity);
        book.setAvailableQuantity(newAvailableQuantity);

        if (request.getAuthorIds() != null) {

            book.getAuthors().clear();

            for (Long authorId : request.getAuthorIds()) {

                Author author = authorRepository.findById(authorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Author not found: " + authorId));

                book.getAuthors().add(author);
            }
        }

        return bookRepository.save(book);
    }

    // ngừng lưu hành sách chứ k xoá vật lí
    public Book deactivateBook(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if ("INACTIVE".equals(book.getStatus())) {
            throw new RuntimeException("Book is already inactive");
        }

        book.setStatus("INACTIVE");
        book.setAvailableQuantity(0);

        return bookRepository.save(book);
    }

    // lưu hành lại sách
    public Book activateBook(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if ("ACTIVE".equals(book.getStatus())) {
            throw new RuntimeException("Book is already active");
        }

        book.setStatus("ACTIVE");

        long availableQuantity =
                bookCopyRepository.countByBookIdAndStatus(id, "AVAILABLE");

        book.setAvailableQuantity((int) availableQuantity);

        return bookRepository.save(book);
    }
}