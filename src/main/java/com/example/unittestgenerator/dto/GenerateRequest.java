package com.example.unittestgenerator.dto;

public class GenerateRequest {
    private String sourceCode;
    private Long userId; // Assuming your User ID is a Long. If it's an Integer or String, change it here!

    public GenerateRequest() {}

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}