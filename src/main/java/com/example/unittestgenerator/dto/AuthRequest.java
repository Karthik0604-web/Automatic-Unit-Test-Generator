package com.example.unittestgenerator.dto;

public class AuthRequest {
    private String username;
    private String password;
    
    // --- ADDED NEW FIELDS ---
    private String email;
    private String fullName;

    // --- Getters and Setters ---
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}