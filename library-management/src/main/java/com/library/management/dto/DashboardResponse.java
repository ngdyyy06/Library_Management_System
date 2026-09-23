package com.library.management.dto;

public class DashboardResponse {

    private long totalBooks;
    private long totalBookQuantity;
    private long totalReaders;
    private long totalAuthors;
    private long totalPublishers;
    private long totalCategories;
    private long activeBorrowings;
    private long totalBorrowings;
    private long totalImportReceipts;

    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;

    private long todayReturns;
    private long todayFineRevenue;
    private long monthlyFineRevenue;

    public DashboardResponse() {
    }

    public DashboardResponse(
            long totalBooks,
            long totalBookQuantity,
            long totalReaders,
            long totalAuthors,
            long totalPublishers,
            long totalCategories,
            long activeBorrowings,
            long totalBorrowings,
            long totalImportReceipts,
            long totalUsers,
            long activeUsers,
            long inactiveUsers,
            long todayReturns,
            long todayFineRevenue,
            long monthlyFineRevenue) {

        this.totalBooks = totalBooks;
        this.totalBookQuantity = totalBookQuantity;
        this.totalReaders = totalReaders;
        this.totalAuthors = totalAuthors;
        this.totalPublishers = totalPublishers;
        this.totalCategories = totalCategories;
        this.activeBorrowings = activeBorrowings;
        this.totalBorrowings = totalBorrowings;
        this.totalImportReceipts = totalImportReceipts;

        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.inactiveUsers = inactiveUsers;

        this.todayReturns = todayReturns;
        this.todayFineRevenue = todayFineRevenue;
        this.monthlyFineRevenue = monthlyFineRevenue;
    }

    public long getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(long totalBooks) {
        this.totalBooks = totalBooks;
    }

    public long getTotalBookQuantity() {
        return totalBookQuantity;
    }

    public void setTotalBookQuantity(long totalBookQuantity) {
        this.totalBookQuantity = totalBookQuantity;
    }

    public long getTotalReaders() {
        return totalReaders;
    }

    public void setTotalReaders(long totalReaders) {
        this.totalReaders = totalReaders;
    }

    public long getTotalAuthors() {
        return totalAuthors;
    }

    public void setTotalAuthors(long totalAuthors) {
        this.totalAuthors = totalAuthors;
    }

    public long getTotalPublishers() {
        return totalPublishers;
    }

    public void setTotalPublishers(long totalPublishers) {
        this.totalPublishers = totalPublishers;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getTotalBorrowings() {
        return totalBorrowings;
    }

    public void setTotalBorrowings(long totalBorrowings) {
        this.totalBorrowings = totalBorrowings;
    }

    public long getTotalImportReceipts() {
        return totalImportReceipts;
    }

    public void setTotalImportReceipts(long totalImportReceipts) {
        this.totalImportReceipts = totalImportReceipts;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getInactiveUsers() {
        return inactiveUsers;
    }

    public void setInactiveUsers(long inactiveUsers) {
        this.inactiveUsers = inactiveUsers;
    }

    public long getTodayReturns() {
        return todayReturns;
    }

    public void setTodayReturns(long todayReturns) {
        this.todayReturns = todayReturns;
    }

    public long getActiveBorrowings() {
        return activeBorrowings;
    }

    public void setActiveBorrowings(long activeBorrowings) {
        this.activeBorrowings = activeBorrowings;
    }

    public long getTodayFineRevenue() {
        return todayFineRevenue;
    }

    public void setTodayFineRevenue(long todayFineRevenue) {
        this.todayFineRevenue = todayFineRevenue;
    }

    public long getMonthlyFineRevenue() {
        return monthlyFineRevenue;
    }

    public void setMonthlyFineRevenue(long monthlyFineRevenue) {
        this.monthlyFineRevenue = monthlyFineRevenue;
    }
}