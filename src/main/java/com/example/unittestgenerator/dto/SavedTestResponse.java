package com.example.unittestgenerator.dto;

public class SavedTestResponse {
    private Long id;
    private String sourceCode;
    private String generatedTestCode;

    public SavedTestResponse(Long id, String sourceCode, String generatedTestCode) {
        this.id = id;
        this.sourceCode = sourceCode;
        this.generatedTestCode = generatedTestCode;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }
    public String getGeneratedTestCode() { return generatedTestCode; }
    public void setGeneratedTestCode(String generatedTestCode) { this.generatedTestCode = generatedTestCode; }
}