package com.library.management.service;

import com.library.management.dto.CreateImportReceiptRequest;
import com.library.management.dto.ImportReceiptDetailRequest;
import com.library.management.entity.*;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class ImportReceiptService {

    private final ImportReceiptRepository importReceiptRepository;
    private final ImportReceiptDetailRepository importReceiptDetailRepository;
    private final BookRepository bookRepository;
    private final PublisherRepository publisherRepository;
    private final UserRepository userRepository;
    private final BookCopyRepository bookCopyRepository;

    public ImportReceiptService(
            ImportReceiptRepository importReceiptRepository,
            ImportReceiptDetailRepository importReceiptDetailRepository,
            BookRepository bookRepository,
            PublisherRepository publisherRepository,
            UserRepository userRepository,
            BookCopyRepository bookCopyRepository) {

        this.importReceiptRepository = importReceiptRepository;
        this.importReceiptDetailRepository = importReceiptDetailRepository;
        this.bookRepository = bookRepository;
        this.publisherRepository = publisherRepository;
        this.userRepository = userRepository;
        this.bookCopyRepository = bookCopyRepository;
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
                        new ResourceNotFoundException(
                                "Publisher not found"
                        ));

        if (!"ACTIVE".equals(publisher.getStatus())) {
            throw new RuntimeException(
                    "Cannot create import receipt with an inactive publisher"
            );
        }

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        ));

        ImportReceipt receipt = new ImportReceipt();

        receipt.setReceiptCode(
                "PN-" + System.currentTimeMillis()
        );

        receipt.setPublisher(publisher);
        receipt.setCreatedBy(user);
        receipt.setImportDate(request.getImportDate());
        receipt.setTotalAmount(BigDecimal.ZERO);
        receipt.setStatus("COMPLETED");

        ImportReceipt savedReceipt =
                importReceiptRepository.save(receipt);

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (ImportReceiptDetailRequest detailRequest
                : request.getDetails()) {

            Book book = bookRepository
                    .findById(detailRequest.getBookId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Book not found: "
                                            + detailRequest.getBookId()
                            ));

            if (!"ACTIVE".equals(book.getStatus())) {
                throw new RuntimeException(
                        "Cannot import an inactive book"
                );
            }

            int quantity = detailRequest.getQuantity();

            if (quantity <= 0) {
                throw new RuntimeException(
                        "Quantity must be greater than 0"
                );
            }

            BigDecimal unitPrice =
                    detailRequest.getUnitPrice();

            if (unitPrice == null
                    || unitPrice.compareTo(BigDecimal.ZERO) < 0) {

                throw new RuntimeException(
                        "Unit price cannot be negative"
                );
            }

            if (importReceiptDetailRepository
                    .existsByImportReceiptIdAndBookId(
                            savedReceipt.getId(),
                            book.getId())) {

                throw new RuntimeException(
                        "Book already exists in this import receipt"
                );
            }

            BigDecimal amount =
                    unitPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            ImportReceiptDetail detail =
                    new ImportReceiptDetail();

            detail.setImportReceipt(savedReceipt);
            detail.setBook(book);
            detail.setQuantity(quantity);
            detail.setUnitPrice(unitPrice);
            detail.setAmount(amount);

            ImportReceiptDetail savedDetail =
                    importReceiptDetailRepository.save(detail);

            book.setTotalQuantity(
                    book.getTotalQuantity() + quantity
            );

            book.setAvailableQuantity(
                    book.getAvailableQuantity() + quantity
            );

            bookRepository.save(book);

            int currentCopyNumber =
                    bookCopyRepository
                            .findByBookId(book.getId())
                            .size();

            for (int i = 1; i <= quantity; i++) {

                BookCopy bookCopy = new BookCopy();

                int copyNumber =
                        currentCopyNumber + i;

                bookCopy.setBarcode(
                        "BOOK-" + book.getId() + "-" +
                                String.format("%03d", copyNumber)
                );

                bookCopy.setBook(book);

                bookCopy.setImportReceiptDetail(savedDetail);

                bookCopy.setStatus("AVAILABLE");

                bookCopyRepository.save(bookCopy);
            }

            totalAmount = totalAmount.add(amount);
        }

        savedReceipt.setTotalAmount(totalAmount);

        return importReceiptRepository.save(savedReceipt);
    }


    // =========================================================
    // UPDATE / EDIT IMPORT RECEIPT
    // =========================================================

    @Transactional
    public ImportReceipt updateImportReceipt(
            Long id,
            CreateImportReceiptRequest request) {

        ImportReceipt receipt = importReceiptRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Import receipt not found"
                        ));

        // Chỉ cho sửa phiếu đang hoạt động
        if (!"COMPLETED".equals(receipt.getStatus())) {
            throw new RuntimeException(
                    "Only completed import receipts can be edited"
            );
        }

        // -----------------------------------------------------
        // Không cho thay đổi Publisher
        // -----------------------------------------------------

        if (!Objects.equals(
                receipt.getPublisher().getId(),
                request.getPublisherId())) {

            throw new RuntimeException(
                    "Publisher of an import receipt cannot be changed"
            );
        }

        // -----------------------------------------------------
        // Import date có thể thay đổi
        // -----------------------------------------------------

        receipt.setImportDate(request.getImportDate());

        List<ImportReceiptDetail> existingDetails =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        List<ImportReceiptDetailRequest> requestDetails =
                request.getDetails();

        if (requestDetails == null
                || requestDetails.isEmpty()) {

            throw new RuntimeException(
                    "Import receipt must contain at least one book"
            );
        }

        // -----------------------------------------------------
        // Kiểm tra duplicate Book trong request
        // -----------------------------------------------------

        Set<Long> requestBookIds = new HashSet<>();

        for (ImportReceiptDetailRequest detailRequest
                : requestDetails) {

            if (detailRequest.getBookId() == null) {
                throw new RuntimeException(
                        "Book is required"
                );
            }

            if (!requestBookIds.add(
                    detailRequest.getBookId())) {

                throw new RuntimeException(
                        "Book cannot appear more than once in an import receipt"
                );
            }
        }

        // -----------------------------------------------------
        // Không cho thêm hoặc xóa Book khỏi receipt
        // Không cho đổi Book của detail
        // -----------------------------------------------------

        if (existingDetails.size() != requestDetails.size()) {

            throw new RuntimeException(
                    "Books in an import receipt cannot be added, removed, or changed"
            );
        }

        for (ImportReceiptDetail existingDetail
                : existingDetails) {

            Long existingBookId =
                    existingDetail.getBook().getId();

            boolean found = false;

            for (ImportReceiptDetailRequest detailRequest
                    : requestDetails) {

                if (Objects.equals(
                        existingBookId,
                        detailRequest.getBookId())) {

                    found = true;
                    break;
                }
            }

            if (!found) {

                throw new RuntimeException(
                        "Books in an import receipt cannot be added, removed, or changed"
                );
            }
        }

        // -----------------------------------------------------
        // Update từng Detail
        // -----------------------------------------------------

        for (ImportReceiptDetail existingDetail
                : existingDetails) {

            ImportReceiptDetailRequest requestDetail =
                    requestDetails.stream()
                            .filter(detailRequest ->
                                    Objects.equals(
                                            detailRequest.getBookId(),
                                            existingDetail
                                                    .getBook()
                                                    .getId()
                                    ))
                            .findFirst()
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Book in import receipt cannot be changed"
                                    ));

            Book book = existingDetail.getBook();

            if (!"ACTIVE".equals(book.getStatus())) {
                throw new RuntimeException(
                        "Cannot edit import receipt because the book is inactive"
                );
            }

            // -------------------------------------------------
            // Validate quantity
            // -------------------------------------------------

            Integer newQuantity =
                    requestDetail.getQuantity();

            if (newQuantity == null || newQuantity <= 0) {

                throw new RuntimeException(
                        "Quantity must be greater than 0"
                );
            }

            int oldQuantity =
                    existingDetail.getQuantity();

            // -------------------------------------------------
            // Validate unit price
            // -------------------------------------------------

            BigDecimal newUnitPrice =
                    requestDetail.getUnitPrice();

            if (newUnitPrice == null
                    || newUnitPrice.compareTo(BigDecimal.ZERO) < 0) {

                throw new RuntimeException(
                        "Unit price cannot be negative"
                );
            }

            // -------------------------------------------------
            // QUANTITY GIẢM
            // -------------------------------------------------

            if (newQuantity < oldQuantity) {

                int removeQuantity =
                        oldQuantity - newQuantity;

                List<BookCopy> importedCopies =
                        bookCopyRepository
                                .findByBookId(book.getId())
                                .stream()
                                .filter(copy ->
                                        copy.getImportReceiptDetail() != null
                                                && Objects.equals(
                                                copy.getImportReceiptDetail().getId(),
                                                existingDetail.getId()
                                        ))
                                .toList();

                /*
                 * Chỉ những copy AVAILABLE mới có thể
                 * bị loại khỏi phiếu nhập.
                 */
                List<BookCopy> availableCopies =
                        importedCopies.stream()
                                .filter(copy ->
                                        "AVAILABLE".equals(
                                                copy.getStatus()
                                        ))
                                .toList();

                /*
                 * Nếu không đủ AVAILABLE copy để giảm
                 * quantity thì không cho sửa.
                 *
                 * Ví dụ:
                 * quantity = 5
                 * 4 AVAILABLE
                 * 1 DAMAGED
                 *
                 * Có thể giảm xuống 4, 3, 2...
                 * nhưng không thể giảm xuống 0 vì
                 * copy DAMAGED không thể tự ý xóa.
                 */
                if (availableCopies.size() < removeQuantity) {

                    throw new RuntimeException(
                            "Cannot reduce quantity because there are not enough available book copies"
                    );
                }

                /*
                 * Những copy bị loại khỏi quantity:
                 *
                 * - Giữ lại record trong DB
                 * - Chuyển thành REMOVED
                 * - Tách khỏi ImportReceiptDetail
                 *
                 * Việc tách detail rất quan trọng để sau này
                 * Activate/Deactivate receipt không khôi phục
                 * nhầm những copy đã bị loại trong quá trình Edit.
                 */
                for (int i = 0;
                     i < removeQuantity;
                     i++) {

                    BookCopy bookCopy =
                            availableCopies.get(i);

                    bookCopy.setStatus("REMOVED");

                    bookCopy.setImportReceiptDetail(null);

                    bookCopyRepository.save(bookCopy);
                }

                // Giảm tổng tồn kho
                if (book.getTotalQuantity()
                        < removeQuantity) {

                    throw new RuntimeException(
                            "Cannot reduce book quantity because total quantity is invalid"
                    );
                }

                // Giảm tồn kho khả dụng
                if (book.getAvailableQuantity()
                        < removeQuantity) {

                    throw new RuntimeException(
                            "Cannot reduce book quantity because available quantity is invalid"
                    );
                }

                book.setTotalQuantity(
                        book.getTotalQuantity()
                                - removeQuantity
                );

                book.setAvailableQuantity(
                        book.getAvailableQuantity()
                                - removeQuantity
                );

                bookRepository.save(book);
            }

            // -------------------------------------------------
            // QUANTITY TĂNG
            // -------------------------------------------------

            if (newQuantity > oldQuantity) {

                int addQuantity =
                        newQuantity - oldQuantity;

                book.setTotalQuantity(
                        book.getTotalQuantity()
                                + addQuantity
                );

                book.setAvailableQuantity(
                        book.getAvailableQuantity()
                                + addQuantity
                );

                bookRepository.save(book);

                /*
                 * Dùng số lượng BookCopy hiện tại để
                 * tạo barcode tiếp theo.
                 *
                 * Những copy REMOVED vẫn tồn tại trong DB,
                 * vì vậy số thứ tự barcode vẫn không bị trùng.
                 */
                int currentCopyNumber =
                        bookCopyRepository
                                .findByBookId(book.getId())
                                .size();

                for (int i = 1;
                     i <= addQuantity;
                     i++) {

                    BookCopy bookCopy =
                            new BookCopy();

                    int copyNumber =
                            currentCopyNumber + i;

                    bookCopy.setBarcode(
                            "BOOK-" + book.getId() + "-" +
                                    String.format(
                                            "%03d",
                                            copyNumber
                                    )
                    );

                    bookCopy.setBook(book);

                    bookCopy.setImportReceiptDetail(
                            existingDetail
                    );

                    bookCopy.setStatus("AVAILABLE");

                    bookCopyRepository.save(bookCopy);
                }
            }

            // -------------------------------------------------
            // Update Detail
            // -------------------------------------------------

            BigDecimal newAmount =
                    newUnitPrice.multiply(
                            BigDecimal.valueOf(newQuantity)
                    );

            existingDetail.setQuantity(
                    newQuantity
            );

            existingDetail.setUnitPrice(
                    newUnitPrice
            );

            existingDetail.setAmount(
                    newAmount
            );

            importReceiptDetailRepository.save(
                    existingDetail
            );
        }

        // -----------------------------------------------------
        // Tính lại tổng tiền của Receipt
        // -----------------------------------------------------

        List<ImportReceiptDetail> updatedDetails =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        BigDecimal totalAmount =
                BigDecimal.ZERO;

        for (ImportReceiptDetail detail
                : updatedDetails) {

            if (detail.getAmount() != null) {

                totalAmount =
                        totalAmount.add(
                                detail.getAmount()
                        );
            }
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
    public ImportReceipt deactivateImportReceipt(Long id) {

        ImportReceipt receipt = importReceiptRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Import receipt not found"
                        ));

        if ("INACTIVE".equals(receipt.getStatus())) {
            throw new RuntimeException(
                    "Import receipt is already inactive"
            );
        }

        if (!"COMPLETED".equals(receipt.getStatus())) {
            throw new RuntimeException(
                    "Only completed import receipts can be deactivated"
            );
        }

        /*
         * Repair các BookCopy cũ chưa có
         * ImportReceiptDetail.
         */
        repairLegacyImportReceiptDetails();

        List<ImportReceiptDetail> details =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        for (ImportReceiptDetail detail : details) {

            Book book = detail.getBook();

            List<BookCopy> bookCopies =
                    bookCopyRepository
                            .findByBookId(book.getId());

            List<BookCopy> importedCopies =
                    bookCopies.stream()
                            .filter(copy ->
                                    copy.getImportReceiptDetail() != null
                                            && Objects.equals(
                                            copy.getImportReceiptDetail().getId(),
                                            detail.getId()
                                    ))
                            .toList();

            int quantity = detail.getQuantity();

            if (importedCopies.isEmpty()) {
                throw new RuntimeException(
                        "Cannot deactivate import receipt because imported book copies are missing"
                );
            }

            int availableCopies = 0;

            for (BookCopy bookCopy : importedCopies) {

                String status = bookCopy.getStatus();

                /*
                 * Nếu copy đang được mượn thì không thể
                 * rollback phiếu nhập.
                 */
                if ("BORROWED".equals(status)) {
                    throw new RuntimeException(
                            "Cannot deactivate import receipt because an imported book copy is currently borrowed"
                    );
                }

                /*
                 * AVAILABLE là copy đang nằm trong kho.
                 * Khi deactivate phiếu nhập, copy này
                 * không còn thuộc tồn kho hoạt động.
                 */
                if ("AVAILABLE".equals(status)) {
                    bookCopy.setStatus("REMOVED");
                    bookCopyRepository.save(bookCopy);

                    availableCopies++;
                }
            }

            if (book.getTotalQuantity() < quantity) {
                throw new RuntimeException(
                        "Cannot deactivate import receipt because book quantity is invalid"
                );
            }

            if (book.getAvailableQuantity() < availableCopies) {
                throw new RuntimeException(
                        "Cannot deactivate import receipt because available quantity is invalid"
                );
            }

            book.setTotalQuantity(
                    book.getTotalQuantity() - quantity
            );

            book.setAvailableQuantity(
                    book.getAvailableQuantity() - availableCopies
            );

            bookRepository.save(book);
        }

        receipt.setStatus("INACTIVE");

        return importReceiptRepository.save(receipt);
    }


    // =========================================================
    // ACTIVATE IMPORT RECEIPT
    // =========================================================

    @Transactional
    public ImportReceipt activateImportReceipt(Long id) {

        ImportReceipt receipt = importReceiptRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Import receipt not found"
                        ));

        if ("COMPLETED".equals(receipt.getStatus())) {
            throw new RuntimeException(
                    "Import receipt is already active"
            );
        }

        if (!"INACTIVE".equals(receipt.getStatus())) {
            throw new RuntimeException(
                    "Only inactive import receipts can be activated"
            );
        }

        /*
         * Repair các BookCopy cũ nếu cần.
         */
        repairLegacyImportReceiptDetails();

        List<ImportReceiptDetail> details =
                importReceiptDetailRepository
                        .findByImportReceiptId(id);

        for (ImportReceiptDetail detail : details) {

            Book book = detail.getBook();

            List<BookCopy> bookCopies =
                    bookCopyRepository
                            .findByBookId(book.getId());

            List<BookCopy> importedCopies =
                    bookCopies.stream()
                            .filter(copy ->
                                    copy.getImportReceiptDetail() != null
                                            && Objects.equals(
                                            copy.getImportReceiptDetail().getId(),
                                            detail.getId()
                                    ))
                            .toList();

            int quantity = detail.getQuantity();

            if (importedCopies.isEmpty()) {
                throw new RuntimeException(
                        "Cannot activate import receipt because imported book copies are missing"
                );
            }

            int restoredAvailableCopies = 0;

            for (BookCopy bookCopy : importedCopies) {

                if ("REMOVED".equals(bookCopy.getStatus())) {

                    bookCopy.setStatus("AVAILABLE");

                    bookCopyRepository.save(bookCopy);

                    restoredAvailableCopies++;
                }
            }

            book.setTotalQuantity(
                    book.getTotalQuantity() + quantity
            );

            book.setAvailableQuantity(
                    book.getAvailableQuantity()
                            + restoredAvailableCopies
            );

            bookRepository.save(book);
        }

        receipt.setStatus("COMPLETED");

        return importReceiptRepository.save(receipt);
    }


    // =========================================================
    // REPAIR LEGACY IMPORT RECEIPT DETAILS
    // =========================================================

    private void repairLegacyImportReceiptDetails() {

        List<ImportReceipt> receipts =
                importReceiptRepository.findAll();

        receipts.sort(
                (r1, r2) ->
                        r1.getId().compareTo(r2.getId())
        );

        for (ImportReceipt receipt : receipts) {

            List<ImportReceiptDetail> details =
                    importReceiptDetailRepository
                            .findByImportReceiptId(
                                    receipt.getId()
                            );

            details.sort(
                    (d1, d2) ->
                            d1.getId().compareTo(d2.getId())
            );

            for (ImportReceiptDetail detail : details) {

                Book book = detail.getBook();

                int requiredQuantity =
                        detail.getQuantity();

                List<BookCopy> allBookCopies =
                        bookCopyRepository
                                .findByBookId(
                                        book.getId()
                                );

                long assignedQuantity =
                        allBookCopies.stream()
                                .filter(copy ->
                                        copy.getImportReceiptDetail() != null
                                                && Objects.equals(
                                                copy.getImportReceiptDetail().getId(),
                                                detail.getId()
                                        ))
                                .count();

                /*
                 * Đã đủ BookCopy cho detail.
                 * Không cần repair.
                 */
                if (assignedQuantity >= requiredQuantity) {
                    continue;
                }

                int missingQuantity =
                        requiredQuantity
                                - (int) assignedQuantity;

                List<BookCopy> legacyCopies =
                        bookCopyRepository
                                .findByBookIdAndImportReceiptDetailIsNullOrderByIdAsc(
                                        book.getId()
                                );

                if (legacyCopies.size() < missingQuantity) {
                    throw new RuntimeException(
                            "Cannot repair legacy import receipt because imported book copies are missing"
                    );
                }

                for (int i = 0;
                     i < missingQuantity;
                     i++) {

                    BookCopy bookCopy =
                            legacyCopies.get(i);

                    bookCopy.setImportReceiptDetail(
                            detail
                    );

                    bookCopyRepository.save(
                            bookCopy
                    );
                }
            }
        }
    }


    // =========================================================
    // GET ALL IMPORT RECEIPTS
    // =========================================================

    public List<ImportReceipt> getAllImportReceipts() {

        return importReceiptRepository.findAll();
    }


    // =========================================================
    // GET IMPORT RECEIPT BY ID
    // =========================================================

    public ImportReceipt getImportReceiptById(Long id) {

        return importReceiptRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Import receipt not found"
                        ));
    }
}