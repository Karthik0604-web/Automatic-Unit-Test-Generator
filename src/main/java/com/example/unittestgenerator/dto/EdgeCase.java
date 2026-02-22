package com.example.unittestgenerator.dto;

public class EdgeCase {
    private String description;
    private String snippet;

    public EdgeCase() {}

    public EdgeCase(String description, String snippet) {
        this.description = description;
        this.snippet = snippet;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }
}