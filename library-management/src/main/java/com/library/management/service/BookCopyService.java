package com.library.management.service;

import com.library.management.dto.CreateBookCopyRequest;
import com.library.management.dto.UpdateBookCopyRequest;
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

        if (!"ACTIVE".equals(book.getStatus())) {
            throw new RuntimeException(
                    "Cannot create book copy because the book is inactive"
            );
        }

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

    public BookCopy updateBookCopy(Long id, CreateBookCopyRequest request) {

        BookCopy bookCopy = bookCopyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book copy not found"));

        // Chỉ cho phép sửa bản sách đang AVAILABLE
        if (!"AVAILABLE".equals(bookCopy.getStatus())) {
            throw new RuntimeException(
                    "Only available book copies can be edited"
            );
        }

        // Kiểm tra barcode trùng
        if (!bookCopy.getBarcode().equals(request.getBarcode())
                && bookCopyRepository.existsByBarcode(request.getBarcode())) {

            throw new RuntimeException("Barcode already exists");
        }

        // Tìm book mới
        Book newBook = bookRepository.findById(request.getBookId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found"));

        // Không cho gán bản sách vào Book đang INACTIVE
        if (!"ACTIVE".equals(newBook.getStatus())) {
            throw new RuntimeException(
                    "Cannot assign book copy to an inactive book"
            );
        }

        Book oldBook = bookCopy.getBook();

        // Nếu đổi sang một Book khác
        if (!oldBook.getId().equals(newBook.getId())) {

            // Book cũ đang ACTIVE thì giảm availableQuantity
            if ("ACTIVE".equals(oldBook.getStatus())
                    && oldBook.getAvailableQuantity() > 0) {

                oldBook.setAvailableQuantity(
                        oldBook.getAvailableQuantity() - 1
                );

                bookRepository.save(oldBook);
            }

            // Book mới tăng availableQuantity
            newBook.setAvailableQuantity(
                    newBook.getAvailableQuantity() + 1
            );

            bookRepository.save(newBook);

            bookCopy.setBook(newBook);
        }

        bookCopy.setBarcode(request.getBarcode());

        return bookCopyRepository.save(bookCopy);
    }

    public BookCopy restoreBookCopy(Long id) {
        BookCopy bookCopy = bookCopyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book copy not found"));

        if (!"LOST".equals(bookCopy.getStatus())
                && !"DAMAGED".equals(bookCopy.getStatus())) {
            throw new RuntimeException(
                    "Only LOST or DAMAGED book copies can be restored"
            );
        }

        bookCopy.setStatus("AVAILABLE");

        Book book = bookCopy.getBook();

        if ("ACTIVE".equals(book.getStatus())) {
            book.setAvailableQuantity(
                    book.getAvailableQuantity() + 1
            );

            bookRepository.save(book);
        }

        return bookCopyRepository.save(bookCopy);
    }

    public BookCopy updateBookCopy(
            Long id,
            UpdateBookCopyRequest request) {

        BookCopy bookCopy = bookCopyRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book copy not found"));

        // Không cho đổi barcode sang barcode đã tồn tại
        if (bookCopyRepository.existsByBarcode(request.getBarcode())
                && !request.getBarcode().equals(bookCopy.getBarcode())) {

            throw new RuntimeException("Barcode already exists");
        }

        Book newBook = bookRepository.findById(request.getBookId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found"));

        // Không cho chuyển bản sao sang sách đang inactive
        if (!"ACTIVE".equals(newBook.getStatus())) {
            throw new RuntimeException(
                    "Cannot assign book copy to an inactive book"
            );
        }

        bookCopy.setBarcode(request.getBarcode());
        bookCopy.setBook(newBook);

        return bookCopyRepository.save(bookCopy);
    }
}