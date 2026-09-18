package com.library.management.config;

import com.library.management.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                // Cho phép Frontend gọi API Backend
                .cors(cors -> {})

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                (request, response, authException) ->
                                        response.setStatus(
                                                jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED
                                        )
                        )
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/test").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register").permitAll()

                        // User Management
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Staff Dashboard
                        .requestMatchers("/api/staff/dashboard")
                        .hasRole("LIBRARIAN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/borrow-requests/my/*/cancel"
                        ).hasRole("READER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/borrow-requests"
                        ).hasAnyRole("LIBRARIAN", "ADMIN")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/borrow-requests/my"
                        ).hasRole("READER")

                        // Reader creates borrowing request
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/borrow-requests"
                        ).hasRole("READER")

                        // Librarian and Admin approve borrowing request
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/borrow-requests/*/approve"
                        ).hasAnyRole("LIBRARIAN", "ADMIN")

                        // Librarian and Admin reject borrowing request
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/borrow-requests/*/reject"
                        ).hasAnyRole("LIBRARIAN", "ADMIN")

                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:3000")
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type")
        );

        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}