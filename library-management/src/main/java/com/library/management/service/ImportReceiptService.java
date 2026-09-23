package com.library.management.service;

import com.library.management.dto.CreateImportReceiptRequest;
import com.library.management.dto.ImportReceiptDetailRequest;
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

    public ImportReceiptService(
            ImportReceiptRepository importReceiptRepository,
            ImportReceiptDetailRepository importReceiptDetailRepository,
            BookRepository bookRepository,
            PublisherRepository publisherRepository,
            UserRepository userRepository) {

        this.importReceiptRepository = importReceiptRepository;
        this.importReceiptDetailRepository = importReceiptDetailRepository;
        this.bookRepository = bookRepository;
        this.publisherRepository = publisherRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE
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

        Set<Long> bookIds = new HashSet<>();

        for (ImportReceiptDetailRequest detailRequest
                : request.getDetails()) {

            if (!bookIds.add(detailRequest.getBookId())) {
                throw new RuntimeException(
                        "Duplicate book in import receipt");
            }

            Book book = bookRepository
                    .findById(detailRequest.getBookId())
                    .orElseThrow(() ->
                            new RuntimeException("Book not found"));

            if (!"ACTIVE".equals(book.getStatus())) {
                throw new RuntimeException(
                        "Book is inactive: " + book.getTitle());
            }

            int quantity = detailRequest.getQuantity();

            BigDecimal unitPrice =
                    detailRequest.getUnitPrice();

            BigDecimal amount =
                    unitPrice.multiply(
                            BigDecimal.valueOf(quantity));

            ImportReceiptDetail detail =
                    new ImportReceiptDetail();

            detail.setImportReceipt(savedReceipt);
            detail.setBook(book);
            detail.setQuantity(quantity);
            detail.setUnitPrice(unitPrice);
            detail.setAmount(amount);

            importReceiptDetailRepository.save(detail);

            // Update inventory
            book.setTotalQuantity(
                    book.getTotalQuantity() + quantity);

            book.setAvailableQuantity(
                    book.getAvailableQuantity() + quantity);

            bookRepository.save(book);

            totalAmount = totalAmount.add(amount);
        }

        savedReceipt.setTotalAmount(totalAmount);

        return importReceiptRepository.save(savedReceipt);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @Transactional
    public ImportReceipt updateImportReceipt(
            Long id,
            CreateImportReceiptRequest request) {

        ImportReceipt receipt =
                importReceiptRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Import receipt not found"));

        if (!"COMPLETED".equals(receipt.getStatus())) {
            throw new RuntimeException(
                    "Only completed import receipts can be updated");
        }

        if (request.getImportDate() != null) {
            receipt.setImportDate(
                    request.getImportDate());
        }

        List<ImportReceiptDetail> oldDetails =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        if (oldDetails.size() != request.getDetails().size()) {
            throw new RuntimeException(
                    "Adding or removing books from an import receipt is not allowed");
        }

        Set<Long> requestBookIds = new HashSet<>();

        for (ImportReceiptDetailRequest detailRequest
                : request.getDetails()) {

            if (!requestBookIds.add(
                    detailRequest.getBookId())) {

                throw new RuntimeException(
                        "Duplicate book in import receipt");
            }
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (ImportReceiptDetail oldDetail : oldDetails) {

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
                                            "Book detail not found"));

            Book book = oldDetail.getBook();

            int oldQuantity =
                    oldDetail.getQuantity();

            int newQuantity =
                    newDetail.getQuantity();

            int difference =
                    newQuantity - oldQuantity;

            /*
             * Quantity decreased
             */
            if (difference < 0) {

                int decrease = Math.abs(difference);

                if (book.getAvailableQuantity() < decrease) {
                    throw new RuntimeException(
                            "Cannot decrease quantity because some books are currently borrowed");
                }

                book.setTotalQuantity(
                        book.getTotalQuantity() - decrease);

                book.setAvailableQuantity(
                        book.getAvailableQuantity() - decrease);
            }

            /*
             * Quantity increased
             */
            else if (difference > 0) {

                book.setTotalQuantity(
                        book.getTotalQuantity() + difference);

                book.setAvailableQuantity(
                        book.getAvailableQuantity() + difference);
            }

            bookRepository.save(book);

            BigDecimal unitPrice =
                    newDetail.getUnitPrice();

            BigDecimal amount =
                    unitPrice.multiply(
                            BigDecimal.valueOf(newQuantity));

            oldDetail.setQuantity(newQuantity);
            oldDetail.setUnitPrice(unitPrice);
            oldDetail.setAmount(amount);

            importReceiptDetailRepository.save(oldDetail);

            totalAmount = totalAmount.add(amount);
        }

        receipt.setTotalAmount(totalAmount);

        return importReceiptRepository.save(receipt);
    }

    // =========================================================
    // DEACTIVATE
    // =========================================================

    @Transactional
    public ImportReceipt deactivateImportReceipt(Long id) {

        ImportReceipt receipt =
                importReceiptRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Import receipt not found"));

        if (!"COMPLETED".equals(receipt.getStatus())) {
            throw new RuntimeException(
                    "Only completed import receipts can be deactivated");
        }

        List<ImportReceiptDetail> details =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        for (ImportReceiptDetail detail : details) {

            Book book = detail.getBook();

            int quantity = detail.getQuantity();

            /*
             * Only available books can be removed
             * from the inventory.
             */
            if (book.getAvailableQuantity() < quantity) {
                throw new RuntimeException(
                        "Cannot deactivate import receipt because some books are currently borrowed: "
                                + book.getTitle());
            }

            book.setTotalQuantity(
                    book.getTotalQuantity() - quantity);

            book.setAvailableQuantity(
                    book.getAvailableQuantity() - quantity);

            bookRepository.save(book);
        }

        receipt.setStatus("INACTIVE");

        return importReceiptRepository.save(receipt);
    }

    // =========================================================
    // ACTIVATE
    // =========================================================

    @Transactional
    public ImportReceipt activateImportReceipt(Long id) {

        ImportReceipt receipt =
                importReceiptRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Import receipt not found"));

        if (!"INACTIVE".equals(receipt.getStatus())) {
            throw new RuntimeException(
                    "Only inactive import receipts can be activated");
        }

        List<ImportReceiptDetail> details =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        for (ImportReceiptDetail detail : details) {

            Book book = detail.getBook();

            int quantity = detail.getQuantity();

            book.setTotalQuantity(
                    book.getTotalQuantity() + quantity);

            book.setAvailableQuantity(
                    book.getAvailableQuantity() + quantity);

            bookRepository.save(book);
        }

        receipt.setStatus("COMPLETED");

        return importReceiptRepository.save(receipt);
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

    public ImportReceipt getImportReceiptById(Long id) {

        return importReceiptRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Import receipt not found"));
    }
}