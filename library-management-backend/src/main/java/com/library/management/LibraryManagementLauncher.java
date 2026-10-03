package com.library.management;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class LibraryManagementLauncher {

    private static final int BACKEND_PORT = 8080;
    private static final int FRONTEND_PORT = 3000;

    public static void main(String[] args) {

        Path projectRoot = Paths.get(System.getProperty("user.dir"))
                .toAbsolutePath();

        Path backendPath = projectRoot.resolve("library-management-backend");
        Path frontendPath = projectRoot.resolve("library-management-frontend");

        if (!Files.exists(backendPath)) {
            return;
        }

        if (!Files.exists(frontendPath)) {
            return;
        }

        Process backendProcess = null;
        Process frontendProcess = null;
        Process edgeProcess = null;

        try {

            // ========================================
            // 0. CLEAN OLD PROCESSES
            // ========================================

            killProcessOnPort(BACKEND_PORT);
            killProcessOnPort(FRONTEND_PORT);

            Thread.sleep(1000);

            // ========================================
            // 1. START BACKEND
            // ========================================

            backendProcess = new ProcessBuilder(
                    "cmd",
                    "/c",
                    "mvnw.cmd",
                    "spring-boot:run"
            )
                    .directory(backendPath.toFile())
                    .inheritIO()
                    .start();

            // ========================================
            // 2. START FRONTEND
            // ========================================

            frontendProcess = new ProcessBuilder(
                    "cmd",
                    "/c",
                    "npm",
                    "run",
                    "dev"
            )
                    .directory(frontendPath.toFile())
                    .inheritIO()
                    .start();

            // ========================================
            // WAIT FOR BACKEND
            // ========================================

            if (!waitForPort(BACKEND_PORT, 120)) {
                return;
            }

            // ========================================
            // WAIT FOR FRONTEND
            // ========================================

            if (!waitForPort(FRONTEND_PORT, 120)) {
                return;
            }

            // ========================================
            // 3. OPEN EDGE APP
            // ========================================

            edgeProcess = openEdge();

            if (edgeProcess == null) {
                return;
            }

            // Wait until Edge app is closed
            edgeProcess.waitFor();

        } catch (Exception ignored) {

        } finally {

            stopProcess(frontendProcess);
            stopProcess(backendProcess);
        }
    }

    // ========================================
    // WAIT FOR PORT
    // ========================================

    private static boolean waitForPort(int port, int timeoutSeconds) {

        long startTime = System.currentTimeMillis();

        while (
                System.currentTimeMillis() - startTime
                        < timeoutSeconds * 1000L
        ) {

            if (isPortOpen(port)) {
                return true;
            }

            try {

                Thread.sleep(1000);

            } catch (InterruptedException e) {

                Thread.currentThread().interrupt();

                return false;
            }
        }

        return false;
    }

    // ========================================
    // CHECK PORT
    // ========================================

    private static boolean isPortOpen(int port) {

        try (Socket socket = new Socket()) {

            socket.connect(
                    new InetSocketAddress("localhost", port),
                    500
            );

            return true;

        } catch (IOException e) {

            return false;
        }
    }

    // ========================================
    // KILL PROCESS USING PORT
    // ========================================

    private static void killProcessOnPort(int port) {

        try {

            Process findProcess = new ProcessBuilder(
                    "cmd",
                    "/c",
                    "netstat -ano | findstr :" + port
            )
                    .redirectErrorStream(true)
                    .start();

            String output = new String(
                    findProcess.getInputStream().readAllBytes()
            );

            findProcess.waitFor();

            String[] lines = output.split("\\R");

            for (String line : lines) {

                line = line.trim();

                if (line.isEmpty()) {
                    continue;
                }

                if (!line.contains("LISTENING")) {
                    continue;
                }

                String[] parts = line.split("\\s+");

                if (parts.length < 5) {
                    continue;
                }

                String pid = parts[parts.length - 1];

                if (!pid.matches("\\d+")) {
                    continue;
                }

                new ProcessBuilder(
                        "cmd",
                        "/c",
                        "taskkill",
                        "/PID",
                        pid,
                        "/T",
                        "/F"
                )
                        .start()
                        .waitFor();
            }

        } catch (Exception ignored) {

        }
    }

    // ========================================
    // OPEN EDGE
    // ========================================

    private static Process openEdge() throws IOException {

        String[] edgePaths = {
                "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
                "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
        };

        String edgePath = null;

        for (String path : edgePaths) {

            if (Files.exists(Paths.get(path))) {

                edgePath = path;

                break;
            }
        }

        if (edgePath == null) {
            edgePath = "msedge.exe";
        }

        Path edgeProfile = Paths.get(
                System.getProperty("user.dir"),
                ".edge-profile"
        ).toAbsolutePath();

        Files.createDirectories(edgeProfile);

        return new ProcessBuilder(
                edgePath,
                "--user-data-dir=" + edgeProfile,
                "--app=http://localhost:3000",
                "--start-maximized"
        ).start();
    }

    // ========================================
    // STOP PROCESS
    // ========================================

    private static void stopProcess(Process process) {

        if (process == null || !process.isAlive()) {
            return;
        }

        try {

            long pid = process.pid();

            new ProcessBuilder(
                    "cmd",
                    "/c",
                    "taskkill",
                    "/PID",
                    String.valueOf(pid),
                    "/T",
                    "/F"
            )
                    .start()
                    .waitFor();

        } catch (Exception e) {

            process.destroyForcibly();
        }
    }
}