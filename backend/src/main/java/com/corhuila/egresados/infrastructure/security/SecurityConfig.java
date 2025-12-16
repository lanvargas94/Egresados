package com.corhuila.egresados.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final AdminUserDetailsService adminUserDetailsService;
    private final CorsFilter corsFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, AdminUserDetailsService adminUserDetailsService, CorsFilter corsFilter) { 
        this.jwtAuthFilter = jwtAuthFilter;
        this.adminUserDetailsService = adminUserDetailsService;
        this.corsFilter = corsFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(cors -> cors.disable()) // Deshabilitar CORS de Spring Security, usar CorsFilter personalizado
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll() // Permitir OPTIONS
                        // Swagger/OpenAPI
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/swagger/**").permitAll()
                        // Endpoints públicos
                        .requestMatchers("/api/admin/auth/login").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/catalog/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        // Endpoints protegidos para egresados
                        .requestMatchers("/api/profile/**").hasRole("GRAD")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/events/*/rsvp", "/api/events/*/waitlist").hasRole("GRAD")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/*/rsvp").hasRole("GRAD")
                        // Rutas admin: ADMIN_GENERAL tiene acceso total, ADMIN_PROGRAMA solo algunas
                        .requestMatchers("/api/admin/users/**", "/api/admin/reports/**").hasRole("ADMIN_GENERAL")
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN_GENERAL", "ADMIN_PROGRAMA")
                        .anyRequest().permitAll()
                )
                .userDetailsService(adminUserDetailsService)
                .addFilterBefore(corsFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
