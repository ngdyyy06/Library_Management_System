package com.library.management.service;

import com.library.management.dto.CreateBorrowingRequest;
import com.library.management.entity.*;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


// phiếu mượn / 1 lần mượn
@Service  // đánh giấu đây là tầng xử lí nghiệp vụ
public class BorrowingService {

    private final BorrowingRepository borrowingRepository;  // thao tác với bảng borrowings
    private final BorrowingDetailRepository borrowingDetailRepository;  // thao tác với bảng borrowing_details
    private final ReaderRepository readerRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;

    public BorrowingService(
            BorrowingRepository borrowingRepository,
            BorrowingDetailRepository borrowingDetailRepository,
            ReaderRepository readerRepository,
            BookCopyRepository bookCopyRepository,
            BookRepository bookRepository) {

        this.borrowingRepository = borrowingRepository;
        this.borrowingDetailRepository = borrowingDetailRepository;
        this.readerRepository = readerRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
    }

    public Borrowing getBorrowingById(Long id) {
        return borrowingRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Borrowing not found"));
    }

    public Borrowing renewBorrowing(Long id) {

        Borrowing borrowing = getBorrowingById(id);

        if ("RETURNED".equals(borrowing.getStatus())) {
            throw new RuntimeException("Returned borrowing cannot be renewed");
        }

        if ("OVERDUE".equals(borrowing.getStatus())) {
            throw new RuntimeException("Overdue borrowing cannot be renewed");
        }

        borrowing.setDueDate(borrowing.getDueDate().plusDays(7));

        borrowing.setRenewalCount(
                borrowing.getRenewalCount() + 1
        );

        return borrowingRepository.save(borrowing);
    }

    @Transactional // yêu cầu full thao tác thành công
    public Borrowing borrowBooks(CreateBorrowingRequest request) {

        // 1. Tìm độc giả
        Reader reader = readerRepository.findById(request.getReaderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reader not found"));

        // 2. Kiểm tra độc giả đang hoạt động
        if (!"ACTIVE".equals(reader.getStatus())) {
            throw new RuntimeException("Reader is not active");
        }

        List<Borrowing> borrowings = borrowingRepository.findByReaderId(reader.getId());

        // Reader bị chặn mượn khi đang có 1 phiếu mượn quá hạn trả
        for (Borrowing borrowing : borrowings) {
            if ("OVERDUE".equals(borrowing.getStatus())) {
                throw new RuntimeException(
                        "Reader has an overdue borrowing"
                );
            }
        }

        // 3. Kiểm tra số lượng sách mượn trong 1 lần
        if (request.getBookCopyIds().size() > 5) {
            throw new RuntimeException("A reader can borrow maximum 5 books");
        }

        // xử lí trường hợp nhập trùng bản sách
        if (request.getBookCopyIds().stream().distinct().count()
                != request.getBookCopyIds().size()) {

            throw new RuntimeException(
                    "Duplicate book copy is not allowed"
            );
        }

        // tìm bản sách hợp lệ để cho mượn
        for (Long bookCopyId : request.getBookCopyIds()) {

            BookCopy bookCopy = bookCopyRepository.findById(bookCopyId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Book copy not found: " + bookCopyId));

            if (!"AVAILABLE".equals(bookCopy.getStatus())) {
                throw new RuntimeException(
                        "Book copy is not available: " + bookCopyId
                );
            }
        }

        long currentBorrowedBooks =
                borrowingDetailRepository.countUnreturnedBooksByReaderId(reader.getId());

        // kiểm tra điều kiện mượn thêm
        if (currentBorrowedBooks + request.getBookCopyIds().size() > 5) {
            throw new RuntimeException(
                    "Reader cannot borrow more than 5 books"
            );
        }

        Borrowing borrowing = new Borrowing(
                null,
                reader,
                LocalDateTime.now(),
                LocalDate.now().plusDays(7),
                "BORROWING"
        );

        borrowing.setRenewalCount(0);
        borrowing = borrowingRepository.save(borrowing);

        // lưu từng bản sách của 1 phiếu mượn vào borrowing_details
        for (Long bookCopyId : request.getBookCopyIds()) {

            BookCopy bookCopy = bookCopyRepository.findById(bookCopyId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Book copy not found: " + bookCopyId
                            ));

            BorrowingDetail detail = new BorrowingDetail();

            detail.setBorrowing(borrowing);
            detail.setBookCopy(bookCopy);
            detail.setReturnedAt(null);
            detail.setFine(0);

            borrowingDetailRepository.save(detail);
            bookCopy.setStatus("BORROWED");
            bookCopyRepository.save(bookCopy);

            // set lại số bản sách có thể cho mượn còn lại
            Book book = bookCopy.getBook();

            book.setAvailableQuantity(
                    book.getAvailableQuantity() - 1
            );

            bookRepository.save(book);
        }

        return borrowing;
    }

    public BorrowingDetail returnBook(Long detailId) {
        BorrowingDetail detail = borrowingDetailRepository.findById(detailId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Borrowing detail not found"));

        if (detail.getReturnedAt() != null) {
            throw new RuntimeException("Book has already been returned");
        }

        BookCopy bookCopy = detail.getBookCopy();
        bookCopy.setStatus("AVAILABLE");
        bookCopyRepository.save(bookCopy);

        Book book = bookCopy.getBook();
        book.setAvailableQuantity(book.getAvailableQuantity() + 1);

        Borrowing borrowing = detail.getBorrowing();

        long unreturnedBooks =
                borrowingDetailRepository.countUnreturnedBooksByBorrowingId(
                        borrowing.getId()
                );

        if (unreturnedBooks == 0) {
            borrowing.setStatus("RETURNED");
        } else {
            borrowing.setStatus("PARTIALLY_RETURNED");
        }

        borrowingRepository.save(borrowing);
        detail.setFine(calculateFine(detail));
        detail.setReturnedAt(LocalDateTime.now());  // ghi thời điểm hiện tại vào database
        borrowingDetailRepository.save(detail);

        return detail;
    }

    // tự động phát hiện quá hạn trả sách
    public void updateOverdueBorrowings() {

        List<Borrowing> borrowings = borrowingRepository.findAll();

        for (Borrowing borrowing : borrowings) {

            if ("BORROWING".equals(borrowing.getStatus())
                    && LocalDate.now().isAfter(borrowing.getDueDate())) {

                borrowing.setStatus("OVERDUE");

                borrowingRepository.save(borrowing);
            }
        }
    }

    public int calculateFine(BorrowingDetail detail) {

        Borrowing borrowing = detail.getBorrowing();

        if (!LocalDate.now().isAfter(borrowing.getDueDate())) {
            return 0;
        }

        // tính so ngày quá hạn
        long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(
                borrowing.getDueDate(),
                LocalDate.now()
        );

        return (int) (overdueDays * 5000);
    }
}