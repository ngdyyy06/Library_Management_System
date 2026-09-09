package com.library.management.controller;

import com.library.management.dto.CreateReaderRequest;
import com.library.management.entity.Reader;
import com.library.management.service.ReaderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController  // Controller xử lý HTTP request và trả dữ liệu trực tiếp về client
@RequestMapping("/api/readers")  // đặt URL gốc cho Controller
public class ReaderController {

    private final ReaderService readerService;

    public ReaderController(ReaderService readerService) {
        this.readerService = readerService;
    }

    @GetMapping
    public List<Reader> getAllReaders() {
        return readerService.getAllReaders();
    }

    @PostMapping // lấy trong JSON và chuyển thành object Reader
    public Reader createReader(@Valid @RequestBody CreateReaderRequest request) {
        return readerService.createReader(request);
    }

    @GetMapping("/{id}")
    public Reader getReaderById(@PathVariable Long id) {
        return readerService.getReaderById(id);
    }

    @PutMapping("/{id}")
    public Reader updateReader(
            @PathVariable Long id,
            @Valid @RequestBody CreateReaderRequest request) {

        return readerService.updateReader(id, request);
    }

    @PatchMapping("/{id}/deactivate")
    public Reader deactivateReader(@PathVariable Long id) {
        return readerService.deactivateReader(id);
    }

    @PatchMapping("/{id}/activate")
    public Reader activateReader(@PathVariable Long id) {
        return readerService.activateReader(id);
    }
}