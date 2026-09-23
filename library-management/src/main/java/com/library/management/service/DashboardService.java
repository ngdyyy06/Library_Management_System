package com.library.management.service;

import com.library.management.dto.DashboardResponse;
import com.library.management.repository.AuthorRepository;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowingDetailRepository;
import com.library.management.repository.BorrowingRepository;
import com.library.management.repository.CategoryRepository;
import com.library.management.repository.ImportReceiptRepository;
import com.library.management.repository.PublisherRepository;
import com.library.management.repository.ReaderRepository;
import com.library.management.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final BookRepository bookRepository;
    private final ReaderRepository readerRepository;
    private final AuthorRepository authorRepository;
    private final PublisherRepository publisherRepository;
    private final CategoryRepository categoryRepository;
    private final BorrowingRepository borrowingRepository;
    private final ImportReceiptRepository importReceiptRepository;
    private final UserRepository userRepository;
    private final BorrowingDetailRepository borrowingDetailRepository;

    public DashboardService(
            BookRepository bookRepository,
            ReaderRepository readerRepository,
            AuthorRepository authorRepository,
            PublisherRepository publisherRepository,
            CategoryRepository categoryRepository,
            BorrowingRepository borrowingRepository,
            ImportReceiptRepository importReceiptRepository,
            UserRepository userRepository,
            BorrowingDetailRepository borrowingDetailRepository) {

        this.bookRepository = bookRepository;
        this.readerRepository = readerRepository;
        this.authorRepository = authorRepository;
        this.publisherRepository = publisherRepository;
        this.categoryRepository = categoryRepository;
        this.borrowingRepository = borrowingRepository;
        this.importReceiptRepository = importReceiptRepository;
        this.userRepository = userRepository;
        this.borrowingDetailRepository = borrowingDetailRepository;
    }

    public DashboardResponse getDashboard() {

        long totalBooks =
                bookRepository.count();

        long totalBookQuantity =
                bookRepository.sumTotalQuantity();

        long totalReaders =
                readerRepository.count();

        long totalAuthors =
                authorRepository.count();

        long totalPublishers =
                publisherRepository.count();

        long totalCategories =
                categoryRepository.count();

        // Chỉ đếm các phiếu đang có trạng thái BORROWING
        long activeBorrowings =
                borrowingRepository.countByStatus("BORROWING");

        long totalBorrowings =
                borrowingRepository.count();

        long totalImportReceipts =
                importReceiptRepository.count();

        long totalUsers =
                userRepository.count();

        long activeUsers =
                userRepository.countByStatus("ACTIVE");

        long inactiveUsers =
                userRepository.countByStatus("INACTIVE");

        long todayReturns =
                borrowingDetailRepository.getTodayReturnedBooks();

        long todayFineRevenue =
                borrowingDetailRepository.getTodayFineRevenue();

        long monthlyFineRevenue =
                borrowingDetailRepository.getMonthlyFineRevenue();

        return new DashboardResponse(
                totalBooks,
                totalBookQuantity,
                totalReaders,
                totalAuthors,
                totalPublishers,
                totalCategories,
                activeBorrowings,
                totalBorrowings,
                totalImportReceipts,
                totalUsers,
                activeUsers,
                inactiveUsers,
                todayReturns,
                todayFineRevenue,
                monthlyFineRevenue
        );
    }
}