package com.library.management.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/app")
public class ShutdownController {

    @PostMapping("/shutdown")
    public void shutdown() {

        Thread shutdownThread = new Thread(() -> {
            try {
                Thread.sleep(300);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            System.exit(0);
        });

        shutdownThread.start();
    }
}