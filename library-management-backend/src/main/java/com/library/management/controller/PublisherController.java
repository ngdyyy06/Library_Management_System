package com.library.management.controller;

import com.library.management.entity.Publisher;
import com.library.management.service.PublisherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publishers")
public class PublisherController {

    private final PublisherService publisherService;

    public PublisherController(PublisherService publisherService) {
        this.publisherService = publisherService;
    }

    @PostMapping
    public ResponseEntity<Publisher> createPublisher(
            @RequestBody Publisher publisher) {

        return ResponseEntity.ok(
                publisherService.createPublisher(publisher)
        );
    }

    @GetMapping
    public ResponseEntity<List<Publisher>> getAllPublishers() {

        return ResponseEntity.ok(
                publisherService.getAllPublishers()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Publisher> getPublisherById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                publisherService.getPublisherById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Publisher> updatePublisher(
            @PathVariable Long id,
            @RequestBody Publisher publisher) {

        return ResponseEntity.ok(
                publisherService.updatePublisher(id, publisher)
        );
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Publisher> activatePublisher(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                publisherService.activatePublisher(id)
        );
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Publisher> deactivatePublisher(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                publisherService.deactivatePublisher(id)
        );
    }
}