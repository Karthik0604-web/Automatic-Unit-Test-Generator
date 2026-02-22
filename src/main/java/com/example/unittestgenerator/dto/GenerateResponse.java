package com.example.unittestgenerator.dto;

import java.util.List;

public class GenerateResponse {
    private String mainTestFileContent;
    private List<Suggestion> suggestions;

    // 1. Empty Constructor (Required by Spring Boot)
    public GenerateResponse() {
    }

    // 2. The exact constructor your GeneratorService is looking for!
    public GenerateResponse(String mainTestFileContent, List<Suggestion> suggestions) {
        this.mainTestFileContent = mainTestFileContent;
        this.suggestions = suggestions;
    }

    // Getters and Setters
    public String getMainTestFileContent() {
        return mainTestFileContent;
    }

    public void setMainTestFileContent(String mainTestFileContent) {
        this.mainTestFileContent = mainTestFileContent;
    }

    public List<Suggestion> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<Suggestion> suggestions) {
        this.suggestions = suggestions;
    }
}