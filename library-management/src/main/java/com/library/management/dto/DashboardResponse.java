package com.library.management.dto;

public class DashboardResponse {

    private long totalBooks;
    private long totalBookCopies;
    private long totalReaders;
    private long totalAuthors;
    private long totalUsers;

    private long activeUsers;
    private long inactiveUsers;

    private long todayFineRevenue;
    private long monthlyFineRevenue;

    public DashboardResponse() {
    }

    public DashboardResponse(
            long totalBooks,
            long totalBookCopies,
            long totalReaders,
            long totalAuthors,
            long totalUsers,
            long activeUsers,
            long inactiveUsers,
            long todayFineRevenue,
            long monthlyFineRevenue
    ) {
        this.totalBooks = totalBooks;
        this.totalBookCopies = totalBookCopies;
        this.totalReaders = totalReaders;
        this.totalAuthors = totalAuthors;
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.inactiveUsers = inactiveUsers;
        this.todayFineRevenue = todayFineRevenue;
        this.monthlyFineRevenue = monthlyFineRevenue;
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

    public long getTotalAuthors() {
        return totalAuthors;
    }

    public void setTotalAuthors(long totalAuthors) {
        this.totalAuthors = totalAuthors;
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