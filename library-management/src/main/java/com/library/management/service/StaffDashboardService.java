package com.library.management.service;

import com.library.management.dto.StaffDashboardResponse;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowingDetailRepository;
import com.library.management.repository.BorrowingRepository;
import com.library.management.repository.LibraryCardPaymentRepository;
import com.library.management.repository.ReaderRepository;
import com.library.management.repository.RenewalPaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class StaffDashboardService {

    private final BookRepository bookRepository;
    private final ReaderRepository readerRepository;
    private final BorrowingRepository borrowingRepository;
    private final BorrowingDetailRepository borrowingDetailRepository;
    private final RenewalPaymentRepository renewalPaymentRepository;
    private final LibraryCardPaymentRepository libraryCardPaymentRepository;

    public StaffDashboardService(
            BookRepository bookRepository,
            ReaderRepository readerRepository,
            BorrowingRepository borrowingRepository,
            BorrowingDetailRepository borrowingDetailRepository,
            RenewalPaymentRepository renewalPaymentRepository,
            LibraryCardPaymentRepository libraryCardPaymentRepository) {

        this.bookRepository = bookRepository;
        this.readerRepository = readerRepository;
        this.borrowingRepository = borrowingRepository;
        this.borrowingDetailRepository = borrowingDetailRepository;
        this.renewalPaymentRepository = renewalPaymentRepository;
        this.libraryCardPaymentRepository = libraryCardPaymentRepository;
    }

    public StaffDashboardResponse getDashboard() {

        long totalBooks =
                bookRepository.count();

        long totalBookQuantity =
                bookRepository.sumTotalQuantity();

        long totalReaders =
                readerRepository.count();

        long totalBorrowings =
                borrowingRepository.count();

        long totalReturns =
                borrowingDetailRepository.countByReturnedAtIsNotNull();

        // =========================
        // Revenue - Today
        // =========================

        long todayFineRevenue =
                borrowingDetailRepository.getTodayFineRevenue();

        BigDecimal todayRenewalRevenue =
                renewalPaymentRepository.getTodayRenewalRevenue();

        LocalDate today = LocalDate.now();

        LocalDateTime startOfToday =
                today.atStartOfDay();

        LocalDateTime startOfTomorrow =
                today.plusDays(1).atStartOfDay();

        BigDecimal todayCardRevenue =
                libraryCardPaymentRepository.getRevenueBetween(
                        startOfToday,
                        startOfTomorrow
                );

        long todayRevenue =
                todayFineRevenue
                        + todayRenewalRevenue.longValue()
                        + todayCardRevenue.longValue();

        // =========================
        // Revenue - This Month
        // =========================

        long monthlyFineRevenue =
                borrowingDetailRepository.getMonthlyFineRevenue();

        BigDecimal monthlyRenewalRevenue =
                renewalPaymentRepository.getMonthlyRenewalRevenue();

        LocalDate firstDayOfMonth =
                today.withDayOfMonth(1);

        LocalDateTime startOfMonth =
                firstDayOfMonth.atStartOfDay();

        LocalDateTime startOfNextMonth =
                firstDayOfMonth
                        .plusMonths(1)
                        .atStartOfDay();

        BigDecimal monthlyCardRevenue =
                libraryCardPaymentRepository.getRevenueBetween(
                        startOfMonth,
                        startOfNextMonth
                );

        long monthlyRevenue =
                monthlyFineRevenue
                        + monthlyRenewalRevenue.longValue()
                        + monthlyCardRevenue.longValue();

        return new StaffDashboardResponse(
                totalBooks,
                totalBookQuantity,
                totalReaders,
                totalBorrowings,
                totalReturns,
                todayRevenue,
                monthlyRevenue
        );
    }
}