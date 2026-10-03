package com.library.management.dto;

public class BorrowingRevenueResponse {

    private long todayRevenue;
    private long monthlyRevenue;

    public BorrowingRevenueResponse() {
    }

    public BorrowingRevenueResponse(
            long todayRevenue,
            long monthlyRevenue) {

        this.todayRevenue = todayRevenue;
        this.monthlyRevenue = monthlyRevenue;
    }

    public long getTodayRevenue() {
        return todayRevenue;
    }

    public void setTodayRevenue(long todayRevenue) {
        this.todayRevenue = todayRevenue;
    }

    public long getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(long monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }
}