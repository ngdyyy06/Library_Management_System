package com.library.management.service;

import com.library.management.dto.CreateBookRequest;
import com.library.management.dto.CreateImportReceiptRequest;
import com.library.management.dto.ImportReceiptDetailRequest;
import com.library.management.dto.NewImportBookRequest;
import com.library.management.entity.Book;
import com.library.management.entity.ImportReceipt;
import com.library.management.entity.ImportReceiptDetail;
import com.library.management.entity.Publisher;
import com.library.management.entity.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.ImportReceiptDetailRepository;
import com.library.management.repository.ImportReceiptRepository;
import com.library.management.repository.PublisherRepository;
import com.library.management.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ImportReceiptService {

    private final ImportReceiptRepository importReceiptRepository;
    private final ImportReceiptDetailRepository importReceiptDetailRepository;
    private final BookRepository bookRepository;
    private final PublisherRepository publisherRepository;
    private final UserRepository userRepository;
    private final BookShelfService bookShelfService;
    private final BookService bookService;

    public ImportReceiptService(
            ImportReceiptRepository importReceiptRepository,
            ImportReceiptDetailRepository importReceiptDetailRepository,
            BookRepository bookRepository,
            PublisherRepository publisherRepository,
            UserRepository userRepository,
            BookShelfService bookShelfService,
            BookService bookService) {

        this.importReceiptRepository = importReceiptRepository;
        this.importReceiptDetailRepository = importReceiptDetailRepository;
        this.bookRepository = bookRepository;
        this.publisherRepository = publisherRepository;
        this.userRepository = userRepository;
        this.bookShelfService = bookShelfService;
        this.bookService = bookService;
    }

    // =========================================================
    // CREATE IMPORT RECEIPT
    // =========================================================

    @Transactional
    public ImportReceipt createImportReceipt(
            CreateImportReceiptRequest request,
            Long userId) {

        Publisher publisher = publisherRepository
                .findById(request.getPublisherId())
                .orElseThrow(() ->
                        new RuntimeException("Publisher not found"));

        if (!"ACTIVE".equals(publisher.getStatus())) {
            throw new RuntimeException("Publisher is inactive");
        }

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("User is inactive");
        }

        ImportReceipt receipt = new ImportReceipt();

        receipt.setReceiptCode(
                "PN-" + System.currentTimeMillis()
        );

        receipt.setPublisher(publisher);
        receipt.setCreatedBy(user);
        receipt.setImportDate(request.getImportDate());
        receipt.setStatus("COMPLETED");
        receipt.setTotalAmount(BigDecimal.ZERO);

        ImportReceipt savedReceipt =
                importReceiptRepository.save(receipt);

        BigDecimal totalAmount = BigDecimal.ZERO;

        /*
         * This Set tracks existing books.
         *
         * New books are checked separately by ISBN
         * through BookService.
         */
        Set<Long> bookIds = new HashSet<>();

        Set<String> newBookIsbns = new HashSet<>();

        for (ImportReceiptDetailRequest detailRequest
                : request.getDetails()) {

            // =================================================
            // Validate Existing Book / New Book
            // =================================================

            boolean hasExistingBook =
                    detailRequest.getBookId() != null;

            boolean hasNewBook =
                    detailRequest.getNewBook() != null;

            if (hasExistingBook && hasNewBook) {

                throw new RuntimeException(
                        "Import detail cannot contain both bookId and newBook"
                );
            }

            if (!hasExistingBook && !hasNewBook) {

                throw new RuntimeException(
                        "Import detail must contain either bookId or newBook"
                );
            }

            // =================================================
            // Quantity
            // =================================================

            int quantity =
                    detailRequest.getQuantity();

            BigDecimal unitPrice =
                    detailRequest.getUnitPrice();

            BigDecimal amount =
                    unitPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            Book book;

            // =================================================
            // EXISTING BOOK
            // =================================================

            if (hasExistingBook) {

                Long bookId =
                        detailRequest.getBookId();

                if (!bookIds.add(bookId)) {

                    throw new RuntimeException(
                            "Duplicate book in import receipt"
                    );
                }

                book = bookRepository
                        .findById(bookId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Book not found: " + bookId
                                )
                        );

                if (!"ACTIVE".equals(book.getStatus())) {

                    throw new RuntimeException(
                            "Book is inactive: "
                                    + book.getTitle()
                    );
                }
            }

            // =================================================
            // NEW BOOK
            // =================================================

            else {

                NewImportBookRequest newBookRequest =
                        detailRequest.getNewBook();

                String isbn =
                        newBookRequest.getIsbn()
                                .trim();

                String normalizedIsbn =
                        isbn.toLowerCase();

                if (!newBookIsbns.add(normalizedIsbn)) {

                    throw new RuntimeException(
                            "Duplicate new book ISBN in import receipt: "
                                    + isbn
                    );
                }

                /*
                 * New Book uses the publisher of the
                 * Import Receipt.
                 */
                CreateBookRequest createBookRequest =
                        new CreateBookRequest();

                createBookRequest.setTitle(
                        newBookRequest.getTitle().trim()
                );

                createBookRequest.setIsbn(isbn);

                createBookRequest.setPublisherId(
                        publisher.getId()
                );

                createBookRequest.setPublishYear(
                        newBookRequest.getPublishYear()
                );

                createBookRequest.setDescription(
                        newBookRequest.getDescription()
                );

                createBookRequest.setPrice(
                        newBookRequest.getPrice()
                );

                createBookRequest.setAuthorIds(
                        newBookRequest.getAuthorIds()
                );

                createBookRequest.setAuthorNames(
                        newBookRequest.getAuthorNames()
                );

                createBookRequest.setCategoryIds(
                        newBookRequest.getCategoryIds()
                );

                createBookRequest.setCategoryNames(
                        newBookRequest.getCategoryNames()
                );

                createBookRequest.setPrimaryCategoryId(
                        newBookRequest.getPrimaryCategoryId()
                );

                /*
                 * BookService creates the Book with:
                 *
                 * totalQuantity = 0
                 * availableQuantity = 0
                 *
                 * because physical quantity belongs
                 * to Import Receipt.
                 */
                book = bookService.createBook(
                        createBookRequest
                );
            }

            // =================================================
            // UPDATE INVENTORY
            // =================================================

            book.setTotalQuantity(
                    book.getTotalQuantity() + quantity
            );

            book.setAvailableQuantity(
                    book.getAvailableQuantity() + quantity
            );

            bookRepository.save(book);

            // =================================================
            // ALLOCATE TO SHELF
            // =================================================

            bookShelfService.allocateBook(
                    book,
                    quantity
            );

            // =================================================
            // CREATE RECEIPT DETAIL
            // =================================================

            ImportReceiptDetail detail =
                    new ImportReceiptDetail();

            detail.setImportReceipt(savedReceipt);
            detail.setBook(book);
            detail.setQuantity(quantity);
            detail.setUnitPrice(unitPrice);
            detail.setAmount(amount);

            importReceiptDetailRepository.save(detail);

            totalAmount =
                    totalAmount.add(amount);
        }

        savedReceipt.setTotalAmount(totalAmount);

        return importReceiptRepository.save(
                savedReceipt
        );
    }

    // =========================================================
    // UPDATE IMPORT RECEIPT
    // =========================================================

    @Transactional
    public ImportReceipt updateImportReceipt(
            Long id,
            CreateImportReceiptRequest request) {

        ImportReceipt receipt =
                importReceiptRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Import receipt not found"
                                ));

        if (!"COMPLETED".equals(receipt.getStatus())) {

            throw new RuntimeException(
                    "Only completed import receipts can be updated"
            );
        }

        if (request.getImportDate() != null) {

            receipt.setImportDate(
                    request.getImportDate()
            );
        }

        List<ImportReceiptDetail> oldDetails =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        if (oldDetails.size()
                != request.getDetails().size()) {

            throw new RuntimeException(
                    "Adding or removing books from an import receipt is not allowed"
            );
        }

        Set<Long> requestBookIds =
                new HashSet<>();

        for (ImportReceiptDetailRequest detailRequest
                : request.getDetails()) {

            /*
             * Updating an existing receipt works with
             * existing Book IDs only.
             */
            if (detailRequest.getBookId() == null) {

                throw new RuntimeException(
                        "New books cannot be added while updating an existing import receipt"
                );
            }

            if (detailRequest.getNewBook() != null) {

                throw new RuntimeException(
                        "New book data is not allowed when updating an existing import receipt"
                );
            }

            if (!requestBookIds.add(
                    detailRequest.getBookId())) {

                throw new RuntimeException(
                        "Duplicate book in import receipt"
                );
            }
        }

        BigDecimal totalAmount =
                BigDecimal.ZERO;

        for (ImportReceiptDetail oldDetail
                : oldDetails) {

            Long bookId =
                    oldDetail.getBook().getId();

            ImportReceiptDetailRequest newDetail =
                    request.getDetails()
                            .stream()
                            .filter(detail ->
                                    detail.getBookId()
                                            .equals(bookId))
                            .findFirst()
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Book detail not found"
                                    ));

            Book book =
                    oldDetail.getBook();

            int oldQuantity =
                    oldDetail.getQuantity();

            int newQuantity =
                    newDetail.getQuantity();

            int difference =
                    newQuantity - oldQuantity;

            // =================================================
            // Quantity increased
            // =================================================

            if (difference > 0) {

                book.setTotalQuantity(
                        book.getTotalQuantity()
                                + difference
                );

                book.setAvailableQuantity(
                        book.getAvailableQuantity()
                                + difference
                );

                bookRepository.save(book);

                bookShelfService.allocateBook(
                        book,
                        difference
                );
            }

            // =================================================
            // Quantity decreased
            // =================================================

            else if (difference < 0) {

                int decrease =
                        Math.abs(difference);

                if (book.getAvailableQuantity()
                        < decrease) {

                    throw new RuntimeException(
                            "Cannot decrease quantity because some books are currently borrowed"
                    );
                }

                bookShelfService.removeBookQuantity(
                        book,
                        decrease
                );

                book.setTotalQuantity(
                        book.getTotalQuantity()
                                - decrease
                );

                book.setAvailableQuantity(
                        book.getAvailableQuantity()
                                - decrease
                );

                bookRepository.save(book);
            }

            BigDecimal unitPrice =
                    newDetail.getUnitPrice();

            BigDecimal amount =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    newQuantity
                            )
                    );

            oldDetail.setQuantity(
                    newQuantity
            );

            oldDetail.setUnitPrice(
                    unitPrice
            );

            oldDetail.setAmount(
                    amount
            );

            importReceiptDetailRepository.save(
                    oldDetail
            );

            totalAmount =
                    totalAmount.add(amount);
        }

        receipt.setTotalAmount(
                totalAmount
        );

        return importReceiptRepository.save(
                receipt
        );
    }

    // =========================================================
    // DEACTIVATE IMPORT RECEIPT
    // =========================================================

    @Transactional
    public ImportReceipt deactivateImportReceipt(
            Long id) {

        ImportReceipt receipt =
                importReceiptRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Import receipt not found"
                                ));

        if (!"COMPLETED".equals(
                receipt.getStatus())) {

            throw new RuntimeException(
                    "Only completed import receipts can be deactivated"
            );
        }

        List<ImportReceiptDetail> details =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        for (ImportReceiptDetail detail
                : details) {

            Book book =
                    detail.getBook();

            int quantity =
                    detail.getQuantity();

            if (book.getAvailableQuantity()
                    < quantity) {

                throw new RuntimeException(
                        "Cannot deactivate import receipt because some books are currently borrowed: "
                                + book.getTitle()
                );
            }

            bookShelfService.removeBookQuantity(
                    book,
                    quantity
            );

            book.setTotalQuantity(
                    book.getTotalQuantity()
                            - quantity
            );

            book.setAvailableQuantity(
                    book.getAvailableQuantity()
                            - quantity
            );

            bookRepository.save(book);
        }

        receipt.setStatus("INACTIVE");

        return importReceiptRepository.save(
                receipt
        );
    }

    // =========================================================
    // ACTIVATE IMPORT RECEIPT
    // =========================================================

    @Transactional
    public ImportReceipt activateImportReceipt(
            Long id) {

        ImportReceipt receipt =
                importReceiptRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Import receipt not found"
                                ));

        if (!"INACTIVE".equals(
                receipt.getStatus())) {

            throw new RuntimeException(
                    "Only inactive import receipts can be activated"
            );
        }

        List<ImportReceiptDetail> details =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        for (ImportReceiptDetail detail
                : details) {

            Book book =
                    detail.getBook();

            int quantity =
                    detail.getQuantity();

            book.setTotalQuantity(
                    book.getTotalQuantity()
                            + quantity
            );

            book.setAvailableQuantity(
                    book.getAvailableQuantity()
                            + quantity
            );

            bookRepository.save(book);

            bookShelfService.allocateBook(
                    book,
                    quantity
            );
        }

        receipt.setStatus("COMPLETED");

        return importReceiptRepository.save(
                receipt
        );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public List<ImportReceipt> getAllImportReceipts() {

        return importReceiptRepository.findAll();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public ImportReceipt getImportReceiptById(
            Long id) {

        return importReceiptRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Import receipt not found"
                        )
                );
    }
}