package com.library.management.service;

import com.library.management.dto.CreateBookCopyRequest;
import com.library.management.entity.Book;
import com.library.management.entity.BookCopy;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.BookCopyRepository;
import com.library.management.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookCopyService {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;

    public BookCopyService(
            BookCopyRepository bookCopyRepository,
            BookRepository bookRepository) {

        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
    }

    public BookCopy createBookCopy(CreateBookCopyRequest request) {

        if (bookCopyRepository.existsByBarcode(request.getBarcode())) {
            throw new RuntimeException("Barcode already exists");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        BookCopy bookCopy = new BookCopy();

        bookCopy.setBarcode(request.getBarcode());
        bookCopy.setBook(book);
        bookCopy.setStatus("AVAILABLE");

        return bookCopyRepository.save(bookCopy);
    }

    public List<BookCopy> getAllBookCopies() {
        return bookCopyRepository.findAll();
    }

    public BookCopy getBookCopyById(Long id) {

        return bookCopyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book copy not found"));
    }

    public BookCopy markAsLost(Long id) {

        BookCopy bookCopy = bookCopyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book copy not found"));

        if (!"AVAILABLE".equals(bookCopy.getStatus())) {
            throw new RuntimeException(
                    "Only available book copies can be marked as lost");
        }

        bookCopy.setStatus("LOST");

        return bookCopyRepository.save(bookCopy);
    }

    // trạng thái bản sách hỏng khi đang ở thư viện
    public BookCopy markAsDamaged(Long id) {

        BookCopy bookCopy = bookCopyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book copy not found"));

        if (!"AVAILABLE".equals(bookCopy.getStatus())) {
            throw new RuntimeException(
                    "Only available book copies can be marked as damaged");
        }

        bookCopy.setStatus("DAMAGED");

        return bookCopyRepository.save(bookCopy);
    }

    // loại bản sách khỏi kho nhng k xoá trong database
    public BookCopy removeBookCopy(Long id) {

        BookCopy bookCopy = bookCopyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book copy not found"));

        if ("BORROWED".equals(bookCopy.getStatus())) {
            throw new RuntimeException(
                    "Borrowed book copies cannot be removed");
        }

        if ("REMOVED".equals(bookCopy.getStatus())) {
            throw new RuntimeException(
                    "Book copy is already removed");
        }

        bookCopy.setStatus("REMOVED");

        return bookCopyRepository.save(bookCopy);
    }
}