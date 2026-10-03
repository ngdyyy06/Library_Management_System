package com.library.management.service;

import com.library.management.dto.ReaderRevenueResponse;
import com.library.management.repository.LibraryCardPaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ReaderRevenueService {

    private final LibraryCardPaymentRepository libraryCardPaymentRepository;

    public ReaderRevenueService(
            LibraryCardPaymentRepository libraryCardPaymentRepository) {

        this.libraryCardPaymentRepository =
                libraryCardPaymentRepository;
    }

    public ReaderRevenueResponse getRevenue() {

        LocalDate today = LocalDate.now();

        // =========================================
        // DOANH THU HÔM NAY
        // = PHÍ LÀM THẺ HÔM NAY
        // =========================================

        LocalDateTime startOfToday =
                today.atStartOfDay();

        LocalDateTime startOfTomorrow =
                today.plusDays(1).atStartOfDay();

        BigDecimal todayRevenue =
                libraryCardPaymentRepository.getRevenueBetween(
                        startOfToday,
                        startOfTomorrow
                );

        // =========================================
        // DOANH THU THÁNG NÀY
        // = PHÍ LÀM THẺ TRONG THÁNG
        // =========================================

        LocalDate firstDayOfMonth =
                today.withDayOfMonth(1);

        LocalDateTime startOfMonth =
                firstDayOfMonth.atStartOfDay();

        LocalDateTime startOfNextMonth =
                firstDayOfMonth
                        .plusMonths(1)
                        .atStartOfDay();

        BigDecimal monthlyRevenue =
                libraryCardPaymentRepository.getRevenueBetween(
                        startOfMonth,
                        startOfNextMonth
                );

        return new ReaderRevenueResponse(
                todayRevenue.longValue(),
                monthlyRevenue.longValue()
        );
    }
}