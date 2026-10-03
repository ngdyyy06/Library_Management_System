package com.library.management.dto;

public class BookShelfListResponse {

    private Long id;
    private String shelfCode;
    private String name;
    private String status;

    private int usedCapacity;
    private int maxCapacity;
    private int availableCapacity;

    public BookShelfListResponse() {
    }

    public BookShelfListResponse(
            Long id,
            String shelfCode,
            String name,
            String status,
            int usedCapacity,
            int maxCapacity,
            int availableCapacity
    ) {
        this.id = id;
        this.shelfCode = shelfCode;
        this.name = name;
        this.status = status;
        this.usedCapacity = usedCapacity;
        this.maxCapacity = maxCapacity;
        this.availableCapacity = availableCapacity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShelfCode() {
        return shelfCode;
    }

    public void setShelfCode(String shelfCode) {
        this.shelfCode = shelfCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getUsedCapacity() {
        return usedCapacity;
    }

    public void setUsedCapacity(int usedCapacity) {
        this.usedCapacity = usedCapacity;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public int getAvailableCapacity() {
        return availableCapacity;
    }

    public void setAvailableCapacity(int availableCapacity) {
        this.availableCapacity = availableCapacity;
    }
}