package com.library.management.dto;

public class StaffDashboardResponse {

    private long totalBooks;
    private long totalBookCopies;
    private long totalBorrowings;
    private long totalReaders;
    private long totalReturns;

    private long todayRevenue;
    private long monthlyRevenue;

    public StaffDashboardResponse() {
    }

    public StaffDashboardResponse(
            long totalBooks,
            long totalBookCopies,
            long totalReaders,
            long totalBorrowings,
            long totalReturns,
            long todayRevenue,
            long monthlyRevenue) {

        this.totalBooks = totalBooks;
        this.totalBookCopies = totalBookCopies;
        this.totalReaders = totalReaders;
        this.totalBorrowings = totalBorrowings;
        this.totalReturns = totalReturns;
        this.todayRevenue = todayRevenue;
        this.monthlyRevenue = monthlyRevenue;
    }

    public long getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(long totalBooks) {
        this.totalBooks = totalBooks;
    }

    public long getTotalBookCopies() {
        return totalBookCopies;
    }

    public void setTotalBookCopies(long totalBookCopies) {
        this.totalBookCopies = totalBookCopies;
    }

    public long getTotalReaders() {
        return totalReaders;
    }

    public void setTotalReaders(long totalReaders) {
        this.totalReaders = totalReaders;
    }

    public long getTotalBorrowings() {
        return totalBorrowings;
    }

    public void setTotalBorrowings(long totalBorrowings) {
        this.totalBorrowings = totalBorrowings;
    }

    public long getTotalReturns() {
        return totalReturns;
    }

    public void setTotalReturns(long totalReturns) {
        this.totalReturns = totalReturns;
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