package com.example.unittestgenerator.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "saved_tests")
public class SavedTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // This links the test to the specific user who generated it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String sourceCode;

    @Column(columnDefinition = "TEXT")
    private String generatedTestCode;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Standard Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }
    public String getGeneratedTestCode() { return generatedTestCode; }
    public void setGeneratedTestCode(String generatedTestCode) { this.generatedTestCode = generatedTestCode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}