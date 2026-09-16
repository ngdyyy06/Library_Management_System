package com.library.management.service;

import com.library.management.dto.CreateBookRequest;
import com.library.management.entity.*;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.AuthorRepository;
import com.library.management.repository.BookCopyRepository;
import com.library.management.repository.BookRepository;
import com.library.management.repository.PublisherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.library.management.repository.CategoryRepository;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorRepository authorRepository;
    private final BookCopyRepository bookCopyRepository;
    private final PublisherRepository publisherRepository;
    private final CategoryRepository categoryRepository;

    public BookService(
            BookRepository bookRepository,
            AuthorRepository authorRepository,
            BookCopyRepository bookCopyRepository,
            PublisherRepository publisherRepository, CategoryRepository categoryRepository) {

        this.bookRepository = bookRepository;
        this.authorRepository = authorRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.publisherRepository = publisherRepository;
        this.categoryRepository = categoryRepository;
    }

    // =========================================================
    // CREATE BOOK
    // =========================================================

    @Transactional
    public Book createBook(CreateBookRequest request) {

        // Check duplicate ISBN
        if (request.getIsbn() != null
                && !request.getIsbn().isBlank()
                && bookRepository.existsByIsbn(request.getIsbn())) {

            throw new RuntimeException("ISBN already exists");
        }

        // Validate price
        if (request.getPrice() == null
                || request.getPrice().compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException("Price cannot be negative");
        }

        Book book = new Book();

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());

        // =====================================================
        // Publisher
        // =====================================================

        Publisher publisher = null;

        if (request.getPublisherId() != null) {

            publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Publisher not found"));

            if (!"ACTIVE".equals(publisher.getStatus())) {

                throw new RuntimeException(
                        "Cannot create book from inactive publisher"
                );
            }
        }

        book.setPublisher(publisher);

        // =====================================================
        // Basic information
        // =====================================================

        book.setPublishYear(request.getPublishYear());
        book.setDescription(request.getDescription());
        book.setPrice(request.getPrice());

        book.setTotalQuantity(request.getTotalQuantity());

        // Khi tạo Book:
        // Available = Total
        book.setAvailableQuantity(request.getTotalQuantity());

        book.setStatus("ACTIVE");

        // =====================================================
        // Authors
        // =====================================================

        Set<Author> authors = resolveAuthors(request);

        book.setAuthors(authors);

        Set<Category> categories = resolveCategories(request);

        book.setCategories(categories);

        Book savedBook = bookRepository.save(book);

        for (int i = 1; i <= savedBook.getTotalQuantity(); i++) {

            BookCopy bookCopy = new BookCopy();

            bookCopy.setBarcode(
                    "BOOK-" + savedBook.getId() + "-" + String.format("%03d", i)
            );

            bookCopy.setBook(savedBook);
            bookCopy.setStatus("AVAILABLE");

            bookCopyRepository.save(bookCopy);
        }

        return savedBook;
    }

    private Set<Author> resolveAuthors(CreateBookRequest request) {

        Set<Author> authors = new HashSet<>();

        // =====================================================
        // Existing Authors
        // =====================================================

        if (request.getAuthorIds() != null) {

            for (Long authorId : request.getAuthorIds()) {

                if (authorId == null) {
                    continue;
                }

                Author author = authorRepository.findById(authorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Author not found: " + authorId
                                )
                        );

                authors.add(author);
            }
        }

        // =====================================================
        // Authors entered by name
        // =====================================================

        if (request.getAuthorNames() != null) {

            Set<String> processedNames = new HashSet<>();

            for (String rawName : request.getAuthorNames()) {

                if (rawName == null || rawName.isBlank()) {
                    continue;
                }

                String trimmedName = rawName.trim();

                String normalizedName =
                        trimmedName.toLowerCase(Locale.ROOT);

                // Tránh nhập trùng cùng một Author
                // Ví dụ:
                // Robert Martin, robert martin
                if (!processedNames.add(normalizedName)) {
                    continue;
                }

                // Tìm Author đã tồn tại
                Author author = authorRepository
                        .findByNameIgnoreCase(trimmedName)
                        .orElse(null);

                // Nếu chưa tồn tại → tạo mới
                if (author == null) {

                    author = new Author();

                    author.setName(trimmedName);
                    author.setStatus("ACTIVE");

                    author = authorRepository.save(author);
                }

                authors.add(author);
            }
        }

        return authors;
    }

    // =========================================================
    // GET ALL BOOKS
    // =========================================================

    public List<Book> getAllBooks() {

        return bookRepository.findAll();
    }

    // =========================================================
    // GET BOOK BY ID
    // =========================================================

    public Book getBookById(Long id) {

        return bookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found"));
    }

    // =========================================================
    // UPDATE BOOK
    // =========================================================

    @Transactional
    public Book updateBook(Long id, CreateBookRequest request) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found"));

        // =====================================================
        // Check duplicate ISBN
        // =====================================================

        if (bookRepository.existsByIsbn(request.getIsbn())
                && !request.getIsbn().equals(book.getIsbn())) {

            throw new RuntimeException("ISBN already exists");
        }

        // =====================================================
        // Validate price
        // =====================================================

        if (request.getPrice() == null
                || request.getPrice().compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException("Price cannot be negative");
        }

        // =====================================================
        // Get current BookCopy data
        // =====================================================

        List<BookCopy> existingCopies =
                bookCopyRepository.findByBookId(book.getId());

        int actualCopyQuantity = existingCopies.size();

        int borrowedQuantity = (int) existingCopies.stream()
                .filter(copy -> "BORROWED".equals(copy.getStatus()))
                .count();

        // =====================================================
        // New quantity
        // =====================================================

        int newTotalQuantity = request.getTotalQuantity();

        if (newTotalQuantity < 0) {

            throw new RuntimeException(
                    "Total quantity cannot be negative"
            );
        }

        // Không được giảm số lượng xuống thấp hơn số bản đang mượn
        if (newTotalQuantity < borrowedQuantity) {

            throw new RuntimeException(
                    "Total quantity cannot be less than borrowed book copies"
            );
        }

        // =====================================================
        // Update basic information
        // =====================================================

        book.setTitle(request.getTitle());
        book.setIsbn(request.getIsbn());
        book.setPublishYear(request.getPublishYear());
        book.setPrice(request.getPrice());
        book.setDescription(request.getDescription());

        // =====================================================
        // Update Publisher
        // =====================================================

        if (request.getPublisherId() != null) {

            Publisher publisher = publisherRepository
                    .findById(request.getPublisherId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Publisher not found"
                            )
                    );

            if (!"ACTIVE".equals(publisher.getStatus())) {

                throw new RuntimeException(
                        "Cannot assign an inactive publisher to book"
                );
            }

            book.setPublisher(publisher);

        } else {

            book.setPublisher(null);
        }

        // =====================================================
        // UPDATE BOOK COPIES
        // =====================================================

        int quantityDifference =
                newTotalQuantity - actualCopyQuantity;

        // =====================================================
        // TĂNG SỐ LƯỢNG
        // =====================================================

        if (quantityDifference > 0) {

            int currentCopyNumber = existingCopies.stream()
                    .map(BookCopy::getBarcode)
                    .filter(barcode -> barcode != null)
                    .mapToInt(barcode -> {

                        try {
                            String number =
                                    barcode.substring(
                                            barcode.lastIndexOf("-") + 1
                                    );

                            return Integer.parseInt(number);

                        } catch (Exception e) {
                            return 0;
                        }

                    })
                    .max()
                    .orElse(existingCopies.size());

            for (int i = 1; i <= quantityDifference; i++) {

                BookCopy bookCopy = new BookCopy();

                int copyNumber = currentCopyNumber + i;

                bookCopy.setBarcode(
                        "BOOK-" + book.getId() + "-" +
                                String.format("%03d", copyNumber)
                );

                bookCopy.setBook(book);
                bookCopy.setStatus("AVAILABLE");

                bookCopyRepository.save(bookCopy);
            }
        }

        // =====================================================
        // GIẢM SỐ LƯỢNG
        // =====================================================

        if (quantityDifference < 0) {

            int numberToRemove =
                    Math.abs(quantityDifference);

            List<BookCopy> availableCopies =
                    existingCopies.stream()
                            .filter(copy ->
                                    "AVAILABLE".equals(copy.getStatus()))
                            .toList();

            if (availableCopies.size() < numberToRemove) {

                throw new RuntimeException(
                        "Cannot reduce total quantity because there are not enough available book copies"
                );
            }

            for (int i = 0; i < numberToRemove; i++) {

                bookCopyRepository.delete(
                        availableCopies.get(i)
                );
            }
        }

        // =====================================================
        // UPDATE TOTAL QUANTITY
        // =====================================================

        book.setTotalQuantity(newTotalQuantity);

        // =====================================================
        // UPDATE AVAILABLE QUANTITY
        // =====================================================

        if (quantityDifference != 0) {

            int availableQuantity =
                    (int) existingCopies.stream()
                            .filter(copy ->
                                    "AVAILABLE".equals(copy.getStatus()))
                            .count();

            if (quantityDifference > 0) {

                availableQuantity += quantityDifference;

            } else {

                availableQuantity -=
                        Math.abs(quantityDifference);
            }

            book.setAvailableQuantity(
                    Math.max(availableQuantity, 0)
            );

        } else {

            book.setAvailableQuantity(
                    request.getAvailableQuantity()
            );
        }

        // =====================================================
        // UPDATE AUTHORS
        // =====================================================

        if (request.getAuthorIds() != null
                || request.getAuthorNames() != null) {

            Set<Author> authors = new HashSet<>();

            // Existing Authors
            if (request.getAuthorIds() != null) {

                for (Long authorId : request.getAuthorIds()) {

                    if (authorId == null) {
                        continue;
                    }

                    Author author = authorRepository
                            .findById(authorId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Author not found: " + authorId
                                    )
                            );

                    authors.add(author);
                }
            }

            // Authors entered by name
            if (request.getAuthorNames() != null) {

                Set<String> processedNames = new HashSet<>();

                for (String rawName : request.getAuthorNames()) {

                    if (rawName == null || rawName.isBlank()) {
                        continue;
                    }

                    String trimmedName = rawName.trim();

                    String normalizedName =
                            trimmedName.toLowerCase(Locale.ROOT);

                    if (!processedNames.add(normalizedName)) {
                        continue;
                    }

                    Author author = authorRepository
                            .findByNameIgnoreCase(trimmedName)
                            .orElse(null);

                    if (author == null) {

                        author = new Author();

                        author.setName(trimmedName);
                        author.setStatus("ACTIVE");

                        author = authorRepository.save(author);
                    }

                    authors.add(author);
                }
            }

            book.setAuthors(authors);
        }

        // =====================================================
        // UPDATE CATEGORIES
        // =====================================================

        if (request.getCategoryIds() != null
                || request.getCategoryNames() != null) {

            Set<Category> categories =
                    resolveCategories(request);

            book.setCategories(categories);
        }

        // =====================================================
        // SAVE BOOK
        // =====================================================

        return bookRepository.save(book);
    }

    // =========================================================
    // DEACTIVATE BOOK
    // =========================================================

    public Book deactivateBook(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found"));

        if ("INACTIVE".equals(book.getStatus())) {

            throw new RuntimeException(
                    "Book is already inactive"
            );
        }

        book.setStatus("INACTIVE");

        // Book inactive → không còn bản available
        book.setAvailableQuantity(0);

        return bookRepository.save(book);
    }

    // =========================================================
    // ACTIVATE BOOK
    // =========================================================

    public Book activateBook(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Book not found"));

        if ("ACTIVE".equals(book.getStatus())) {

            throw new RuntimeException(
                    "Book is already active"
            );
        }

        book.setStatus("ACTIVE");

        // Tính lại số lượng thực tế từ BookCopy
        long availableQuantity =
                bookCopyRepository.countByBookIdAndStatus(
                        id,
                        "AVAILABLE"
                );

        book.setAvailableQuantity(
                (int) availableQuantity
        );

        return bookRepository.save(book);
    }

    private Set<Category> resolveCategories(CreateBookRequest request) {

        Set<Category> categories = new HashSet<>();

        // =========================
        // Category đã tồn tại
        // =========================

        if (request.getCategoryIds() != null) {

            for (Long categoryId : request.getCategoryIds()) {

                if (categoryId == null) {
                    continue;
                }

                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found: " + categoryId));

                categories.add(category);
            }
        }

        // =========================
        // Category nhập bằng tên
        // =========================

        if (request.getCategoryNames() != null) {

            Set<String> processedNames = new HashSet<>();

            for (String rawName : request.getCategoryNames()) {

                if (rawName == null || rawName.isBlank()) {
                    continue;
                }

                String categoryName = rawName.trim();

                String normalizedName =
                        categoryName.toLowerCase(Locale.ROOT);

                // Tránh nhập trùng Category trong cùng request
                if (!processedNames.add(normalizedName)) {
                    continue;
                }

                // Tìm Category đã tồn tại
                Category category = categoryRepository
                        .findByNameIgnoreCase(categoryName)
                        .orElse(null);

                // Nếu chưa tồn tại → tự tạo
                if (category == null) {

                    category = new Category();

                    category.setName(categoryName);
                    category.setStatus("ACTIVE");

                    category = categoryRepository.save(category);
                }

                categories.add(category);
            }
        }

        return categories;
    }
}