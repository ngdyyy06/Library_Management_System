package com.library.management.service;

import com.library.management.dto.CreateBorrowingRequest;
import com.library.management.dto.RenewBorrowingRequest;
import com.library.management.dto.ReturnBookRequest;
import com.library.management.entity.*;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// phiếu mượn / 1 lần mượn
@Service
public class BorrowingService {

    private final BorrowingRepository borrowingRepository;
    private final BorrowingDetailRepository borrowingDetailRepository;
    private final ReaderRepository readerRepository;
    private final BookRepository bookRepository;
    private final RenewalPaymentRepository renewalPaymentRepository;
    private final ReturnHistoryRepository returnHistoryRepository;

    public BorrowingService(
            BorrowingRepository borrowingRepository,
            BorrowingDetailRepository borrowingDetailRepository,
            ReaderRepository readerRepository,
            BookRepository bookRepository,
            RenewalPaymentRepository renewalPaymentRepository,
            ReturnHistoryRepository returnHistoryRepository) {

        this.borrowingRepository = borrowingRepository;
        this.borrowingDetailRepository = borrowingDetailRepository;
        this.readerRepository = readerRepository;
        this.bookRepository = bookRepository;
        this.renewalPaymentRepository = renewalPaymentRepository;
        this.returnHistoryRepository = returnHistoryRepository;
    }

    // =========================================================
    // GET ALL BORROWINGS
    // =========================================================

    public List<Borrowing> getAllBorrowings() {

        return borrowingRepository.findAll();
    }

    // =========================================================
    // GET BORROWING BY ID
    // =========================================================

    public Borrowing getBorrowingById(Long id) {

        return borrowingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Borrowing not found"
                        ));
    }

    // =========================================================
    // GET BORROWING DETAILS
    // =========================================================

    public List<BorrowingDetail> getBorrowingDetails(
            Long borrowingId) {

        return borrowingDetailRepository
                .findByBorrowingId(borrowingId);
    }

    // =========================================================
    // RENEW BORROWING
    // =========================================================

    @Transactional
    public Borrowing renewBorrowing(
            Long id,
            RenewBorrowingRequest request) {

        Borrowing borrowing =
                getBorrowingById(id);

        // =====================================================
        // 1. KIỂM TRA TRẠNG THÁI PHIẾU
        // =====================================================

        if ("OVERDUE".equals(
                borrowing.getStatus())) {

            throw new RuntimeException(
                    "Overdue borrowing cannot be renewed. Please return the books."
            );
        }

        if ("RETURNED".equals(
                borrowing.getStatus())) {

            throw new RuntimeException(
                    "Returned borrowing cannot be renewed."
            );
        }

        if (!"BORROWING".equals(
                borrowing.getStatus())
                && !"PARTIALLY_RETURNED".equals(
                borrowing.getStatus())) {

            throw new RuntimeException(
                    "Only active borrowing can be renewed."
            );
        }

        // =====================================================
        // 2. KIỂM TRA SỐ LẦN GIA HẠN
        // =====================================================

        if (borrowing.getRenewalCount() >= 2) {

            throw new RuntimeException(
                    "This borrowing has reached the maximum renewal limit of 2 times."
            );
        }

        // =====================================================
        // 3. KIỂM TRA SỐ NGÀY GIA HẠN
        // =====================================================

        Integer days =
                request.getDays();

        if (days == null
                || days < 3
                || days > 30) {

            throw new RuntimeException(
                    "Renewal period must be between 3 and 30 days."
            );
        }

        // =====================================================
        // 4. KIỂM TRA THANH TOÁN
        // =====================================================

        if (!Boolean.TRUE.equals(
                request.getPaymentConfirmed())) {

            throw new RuntimeException(
                    "Renewal requires payment confirmation."
            );
        }

        // =====================================================
        // 5. TÍNH PHÍ GIA HẠN
        // 1.000 VNĐ / 1 NGÀY
        // =====================================================

        BigDecimal renewalFee =
                BigDecimal.valueOf(days)
                        .multiply(
                                BigDecimal.valueOf(1000)
                        );

        // =====================================================
        // 6. LƯU GIAO DỊCH THANH TOÁN GIA HẠN
        // =====================================================

        RenewalPayment renewalPayment =
                new RenewalPayment();

        renewalPayment.setBorrowing(
                borrowing
        );

        renewalPayment.setDays(
                days
        );

        renewalPayment.setAmount(
                renewalFee
        );

        renewalPayment.setPaidAt(
                LocalDateTime.now()
        );

        renewalPaymentRepository.save(
                renewalPayment
        );

        // =====================================================
        // 7. GIA HẠN
        // =====================================================

        borrowing.setDueDate(
                borrowing.getDueDate()
                        .plusDays(days)
        );

        borrowing.setRenewalCount(
                borrowing.getRenewalCount() + 1
        );

        return borrowingRepository.save(
                borrowing
        );
    }

    // =========================================================
    // BORROW BOOKS
    // =========================================================

    @Transactional
    public Borrowing borrowBooks(
            CreateBorrowingRequest request) {

        // 1. Tìm độc giả
        Reader reader =
                readerRepository
                        .findById(request.getReaderId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Reader not found"
                                ));

        // 2. Kiểm tra độc giả đang hoạt động
        if (!"ACTIVE".equals(
                reader.getStatus())) {

            throw new RuntimeException(
                    "Reader is not active"
            );
        }

        // 3. Kiểm tra độc giả có phiếu quá hạn
        List<Borrowing> borrowings =
                borrowingRepository
                        .findByReaderId(
                                reader.getId()
                        );

        for (Borrowing borrowing
                : borrowings) {

            if ("OVERDUE".equals(
                    borrowing.getStatus())) {

                throw new RuntimeException(
                        "Reader has an overdue borrowing"
                );
            }
        }

        // 4. Kiểm tra tổng số lượng sách trong lần mượn
        int totalQuantity =
                request.getBooks()
                        .stream()
                        .mapToInt(
                                CreateBorrowingRequest
                                        .BookBorrowItem::getQuantity
                        )
                        .sum();

        if (totalQuantity > 5) {

            throw new RuntimeException(
                    "A reader can borrow maximum 5 books"
            );
        }

        // 5. Kiểm tra sách không bị trùng
        long distinctBookCount =
                request.getBooks()
                        .stream()
                        .map(
                                CreateBorrowingRequest
                                        .BookBorrowItem::getBookId
                        )
                        .distinct()
                        .count();

        if (distinctBookCount
                != request.getBooks().size()) {

            throw new RuntimeException(
                    "Duplicate book is not allowed"
            );
        }

        // 6. Kiểm tra từng sách
        List<Book> books =
                new ArrayList<>();

        for (
                CreateBorrowingRequest.BookBorrowItem item
                : request.getBooks()
        ) {

            Book book =
                    bookRepository
                            .findById(item.getBookId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Book not found: "
                                                    + item.getBookId()
                                    ));

            if (!"ACTIVE".equals(
                    book.getStatus())) {

                throw new RuntimeException(
                        "Book is inactive: "
                                + book.getTitle()
                );
            }

            if (book.getAvailableQuantity()
                    < item.getQuantity()) {

                throw new RuntimeException(
                        "Not enough available books: "
                                + book.getTitle()
                );
            }

            books.add(book);
        }

        // 7. Kiểm tra tổng số sách reader đang mượn
        long currentBorrowedBooks =
                borrowingDetailRepository
                        .countUnreturnedBooksByReaderId(
                                reader.getId()
                        );

        if (currentBorrowedBooks
                + totalQuantity > 5) {

            throw new RuntimeException(
                    "Reader cannot borrow more than 5 books"
            );
        }

        // 8. Tính tiền đặt cọc
        BigDecimal depositAmount =
                BigDecimal.ZERO;

        for (int i = 0;
             i < request.getBooks().size();
             i++) {

            CreateBorrowingRequest.BookBorrowItem item =
                    request.getBooks().get(i);

            Book book =
                    books.get(i);

            BigDecimal bookDeposit =
                    book.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            item.getQuantity()
                                    )
                            );

            depositAmount =
                    depositAmount.add(
                            bookDeposit
                    );
        }

        // 9. Tạo phiếu mượn
        Borrowing borrowing =
                new Borrowing(
                        null,
                        reader,
                        LocalDateTime.now(),
                        LocalDate.now().plusDays(7),
                        "BORROWING"
                );

        borrowing.setRenewalCount(0);

        borrowing.setDepositAmount(
                depositAmount
        );

        borrowing =
                borrowingRepository.save(
                        borrowing
                );

        // 10. Tạo chi tiết mượn
        for (int i = 0;
             i < request.getBooks().size();
             i++) {

            CreateBorrowingRequest.BookBorrowItem item =
                    request.getBooks().get(i);

            Book book =
                    books.get(i);

            BorrowingDetail detail =
                    new BorrowingDetail();

            detail.setBorrowing(
                    borrowing
            );

            detail.setBook(
                    book
            );

            detail.setQuantity(
                    item.getQuantity()
            );

            detail.setGoodQuantity(0);

            detail.setDamagedQuantity(0);

            detail.setLostQuantity(0);

            detail.setReturnedAt(null);

            detail.setFine(0);

            detail.setDamageFine(
                    BigDecimal.ZERO
            );

            borrowingDetailRepository.save(
                    detail
            );

            // 11. Giảm số lượng sách có thể cho mượn
            book.setAvailableQuantity(
                    book.getAvailableQuantity()
                            - item.getQuantity()
            );

            bookRepository.save(
                    book
            );
        }

        return borrowing;
    }

    // =========================================================
    // TRẢ SÁCH
    // =========================================================

    @Transactional
    public BorrowingDetail returnBook(
            Long detailId,
            ReturnBookRequest request) {

        // 1. Tìm borrowing detail
        BorrowingDetail detail =
                borrowingDetailRepository
                        .findById(detailId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrowing detail not found"
                                ));

        Book book =
                detail.getBook();

        // =====================================================
        // 2. TÍNH SỐ LƯỢNG ĐÃ TRẢ TRƯỚC ĐÓ
        // =====================================================

        int alreadyReturned =
                detail.getGoodQuantity()
                        + detail.getDamagedQuantity()
                        + detail.getLostQuantity();

        // =====================================================
        // 3. TÍNH SỐ LƯỢNG CÒN PHẢI TRẢ
        // =====================================================

        int remainingQuantity =
                detail.getQuantity()
                        - alreadyReturned;

        // =====================================================
        // 4. LẤY SỐ LƯỢNG TRẢ TRONG LẦN NÀY
        // =====================================================

        int goodQuantity =
                request.getGoodQuantity();

        int damagedQuantity =
                request.getDamagedQuantity();

        int lostQuantity =
                request.getLostQuantity();

        // =====================================================
        // 5. KHÔNG CHO SỐ LƯỢNG ÂM
        // =====================================================

        if (goodQuantity < 0
                || damagedQuantity < 0
                || lostQuantity < 0) {

            throw new RuntimeException(
                    "Return quantities cannot be negative"
            );
        }

        // =====================================================
        // 6. TỔNG SỐ LƯỢNG TRẢ TRONG LẦN NÀY
        // =====================================================

        int currentReturnedQuantity =
                goodQuantity
                        + damagedQuantity
                        + lostQuantity;

        // Không được trả 0 sách
        if (currentReturnedQuantity <= 0) {

            throw new RuntimeException(
                    "At least one book must be returned"
            );
        }

        // =====================================================
        // 7. KHÔNG ĐƯỢC TRẢ QUÁ SỐ LƯỢNG CÒN LẠI
        // =====================================================

        if (currentReturnedQuantity
                > remainingQuantity) {

            throw new RuntimeException(
                    "Return quantity cannot exceed the remaining quantity of "
                            + remainingQuantity
            );
        }

        // =====================================================
        // 8. CỘNG DỒN SỐ LƯỢNG ĐÃ TRẢ
        // =====================================================

        detail.setGoodQuantity(
                detail.getGoodQuantity()
                        + goodQuantity
        );

        detail.setDamagedQuantity(
                detail.getDamagedQuantity()
                        + damagedQuantity
        );

        detail.setLostQuantity(
                detail.getLostQuantity()
                        + lostQuantity
        );

        // =====================================================
        // 9. SÁCH GOOD QUAY LẠI KHO
        // =====================================================

        if (goodQuantity > 0) {

            book.setAvailableQuantity(
                    book.getAvailableQuantity()
                            + goodQuantity
            );
        }

        // =====================================================
        // 10. TÍNH PHÍ TRẢ MUỘN
        // =====================================================

        int lateFine =
                calculateFine(detail);

        detail.setFine(
                detail.getFine()
                        + lateFine
        );

        // =====================================================
        // 11. PHÍ DAMAGE
        // 50.000 VNĐ / 1 SÁCH HỎNG
        // =====================================================

        BigDecimal damageFine =
                BigDecimal.valueOf(
                                damagedQuantity
                        )
                        .multiply(
                                new BigDecimal("50000")
                        );

        // =====================================================
        // 12. PHÍ LOST
        // GIÁ SÁCH × SỐ SÁCH MẤT
        // =====================================================

        BigDecimal lostFine =
                book.getPrice()
                        .multiply(
                                BigDecimal.valueOf(
                                        lostQuantity
                                )
                        );

        BigDecimal currentDamageFine =
                damageFine.add(
                        lostFine
                );

        detail.setDamageFine(
                detail.getDamageFine()
                        .add(
                                currentDamageFine
                        )
        );

        // =====================================================
        // 13. KIỂM TRA DETAIL ĐÃ TRẢ HẾT CHƯA
        // =====================================================

        int totalReturnedAfterThisTime =
                detail.getGoodQuantity()
                        + detail.getDamagedQuantity()
                        + detail.getLostQuantity();

        if (totalReturnedAfterThisTime
                == detail.getQuantity()) {

            detail.setReturnedAt(
                    LocalDateTime.now()
            );
        }

        // =====================================================
        // 14. LƯU DETAIL + BOOK
        // =====================================================

        borrowingDetailRepository.save(
                detail
        );

        bookRepository.save(
                book
        );

        // =====================================================
        // 15. LẤY PHIẾU MƯỢN
        // =====================================================

        Borrowing borrowing =
                detail.getBorrowing();

        // =====================================================
        // 16. KIỂM TRA TOÀN BỘ PHIẾU ĐÃ TRẢ HẾT CHƯA
        // =====================================================

        long unreturnedBooks =
                borrowingDetailRepository
                        .countUnreturnedBooksByBorrowingId(
                                borrowing.getId()
                        );

        String returnStatus;

        if (unreturnedBooks == 0) {

            borrowing.setStatus(
                    "RETURNED"
            );

            returnStatus =
                    "RETURNED";

        } else {

            borrowing.setStatus(
                    "PARTIALLY_RETURNED"
            );

            returnStatus =
                    "PARTIALLY_RETURNED";
        }

        borrowingRepository.save(
                borrowing
        );

        // =====================================================
        // 17. LƯU RETURN HISTORY
        // =====================================================

        ReturnHistory returnHistory =
                new ReturnHistory();

        returnHistory.setBorrowingDetail(
                detail
        );

        returnHistory.setBorrowing(
                borrowing
        );

        returnHistory.setBook(
                book
        );

        returnHistory.setGoodQuantity(
                goodQuantity
        );

        returnHistory.setDamagedQuantity(
                damagedQuantity
        );

        returnHistory.setLostQuantity(
                lostQuantity
        );

        returnHistory.setFine(
                lateFine
        );

        returnHistory.setDamageFine(
                currentDamageFine
        );

        returnHistory.setReturnedAt(
                LocalDateTime.now()
        );

        returnHistory.setStatus(
                returnStatus
        );

        returnHistoryRepository.save(
                returnHistory
        );

        return detail;
    }

    // =========================================================
    // OVERDUE
    // =========================================================

    public void updateOverdueBorrowings() {

        List<Borrowing> borrowings =
                borrowingRepository.findAll();

        for (Borrowing borrowing
                : borrowings) {

            if ("BORROWING".equals(
                    borrowing.getStatus())
                    && LocalDate.now().isAfter(
                    borrowing.getDueDate())) {

                borrowing.setStatus(
                        "OVERDUE"
                );

                borrowingRepository.save(
                        borrowing
                );
            }
        }
    }

    // =========================================================
    // TÍNH PHÍ TRẢ MUỘN
    // =========================================================

    public int calculateFine(
            BorrowingDetail detail) {

        Borrowing borrowing =
                detail.getBorrowing();

        if (!LocalDate.now().isAfter(
                borrowing.getDueDate())) {

            return 0;
        }

        long overdueDays =
                java.time.temporal.ChronoUnit.DAYS
                        .between(
                                borrowing.getDueDate(),
                                LocalDate.now()
                        );

        return (int) (
                overdueDays * 5000
        );
    }

    // =========================================================
    // GET DETAIL
    // =========================================================

    public BorrowingDetail getBorrowingDetailById(
            Long detailId) {

        return borrowingDetailRepository
                .findById(detailId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Borrowing detail not found"
                        ));
    }

    // =========================================================
    // GET RETURN HISTORY
    // =========================================================

    public List<ReturnHistory> getReturnHistory() {

        return returnHistoryRepository
                .findAllByOrderByReturnedAtDesc();
    }
}