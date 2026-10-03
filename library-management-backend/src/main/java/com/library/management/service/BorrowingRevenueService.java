package com.library.management.service;

import com.library.management.dto.BorrowingRevenueResponse;
import com.library.management.repository.BorrowingDetailRepository;
import com.library.management.repository.RenewalPaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class BorrowingRevenueService {

    private final BorrowingDetailRepository borrowingDetailRepository;
    private final RenewalPaymentRepository renewalPaymentRepository;

    public BorrowingRevenueService(
            BorrowingDetailRepository borrowingDetailRepository,
            RenewalPaymentRepository renewalPaymentRepository) {

        this.borrowingDetailRepository = borrowingDetailRepository;
        this.renewalPaymentRepository = renewalPaymentRepository;
    }

    public BorrowingRevenueResponse getRevenue() {

        /*
         * ==========================================
         * TODAY
         * ==========================================
         */

        long todayFineRevenue =
                borrowingDetailRepository.getTodayFineRevenue();

        BigDecimal todayRenewalRevenue =
                renewalPaymentRepository.getTodayRenewalRevenue();

        long todayRevenue =
                todayFineRevenue
                        + todayRenewalRevenue.longValue();


        /*
         * ==========================================
         * THIS MONTH
         * ==========================================
         */

        long monthlyFineRevenue =
                borrowingDetailRepository.getMonthlyFineRevenue();

        BigDecimal monthlyRenewalRevenue =
                renewalPaymentRepository.getMonthlyRenewalRevenue();

        long monthlyRevenue =
                monthlyFineRevenue
                        + monthlyRenewalRevenue.longValue();


        return new BorrowingRevenueResponse(
                todayRevenue,
                monthlyRevenue
        );
    }
}