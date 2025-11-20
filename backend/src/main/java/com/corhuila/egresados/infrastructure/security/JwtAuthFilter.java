package com.corhuila.egresados.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) { this.jwtUtil = jwtUtil; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Permitir peticiones OPTIONS (preflight de CORS) sin autenticación
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String auth = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                var claims = jwtUtil.parse(token);
                String user = claims.getSubject();
                String role = (String) claims.getOrDefault("role", "");
                var authToken = new UsernamePasswordAuthenticationToken(user, null,
                        role.isEmpty() ? List.of() : List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } catch (Exception ignored) { }
        }
        filterChain.doFilter(request, response);
    }
}

