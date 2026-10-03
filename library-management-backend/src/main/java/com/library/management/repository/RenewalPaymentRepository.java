package com.library.management.repository;

import com.library.management.entity.RenewalPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;

public interface RenewalPaymentRepository
        extends JpaRepository<RenewalPayment, Long> {

    @Query("""
            SELECT COALESCE(SUM(rp.amount), 0)
            FROM RenewalPayment rp
            WHERE FUNCTION('DATE', rp.paidAt) = CURRENT_DATE
            """)
    BigDecimal getTodayRenewalRevenue();

    @Query("""
            SELECT COALESCE(SUM(rp.amount), 0)
            FROM RenewalPayment rp
            WHERE YEAR(rp.paidAt) = YEAR(CURRENT_DATE)
            AND MONTH(rp.paidAt) = MONTH(CURRENT_DATE)
            """)
    BigDecimal getMonthlyRenewalRevenue();
}