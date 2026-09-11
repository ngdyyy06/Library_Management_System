package com.library.management.config;

import com.library.management.entity.User;
import com.library.management.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.library.management.repository.UserRepository;

import java.util.List;

@Component  // báo Spring quản lí và tạo object
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            jakarta.servlet.http.HttpServletRequest request,
            jakarta.servlet.http.HttpServletResponse response,
            jakarta.servlet.FilterChain filterChain)
            throws jakarta.servlet.ServletException, java.io.IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Bỏ 7 kí tự "Bearer "
        String jwt = authHeader.substring(7);

        String username;

        try {
            username = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            response.setStatus(
                    jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED
            );
            return;
        }

        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // tài khoản bị cấm sẽ k thể thực hiện request
        if ("INACTIVE".equals(user.getStatus())) {
            response.setStatus(
                    jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED
            );
            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        null,
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" + user.getRole().getName()
                                )
                        )
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}