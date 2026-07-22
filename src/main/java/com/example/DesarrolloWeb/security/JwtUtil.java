package com.example.DesarrolloWeb.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {

    private final String SECRET = "EstaEsUnaClaveSecretaMuySeguraParaOdontologiaWeb123456";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    private final long expirationTime = 86400000; 

    public String generarToken(String username, String rol) {
        return Jwts.builder()
                .setClaims(Map.of("rol", rol))
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key)
                .compact();
    }

    public Claims extraerClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extraerUsername(String token) {
        return extraerClaims(token).getSubject();
    }

    public boolean validarToken(String token, String username) {
        String tokenUsername = extraerUsername(token);
        return (tokenUsername.equals(username) && !extraerClaims(token).getExpiration().before(new Date()));
    }
}