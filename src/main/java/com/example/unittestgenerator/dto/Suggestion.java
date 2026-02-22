package com.example.unittestgenerator.dto;

import java.util.List;

public class Suggestion {
    private String targetMethodName;
    private String methodSignature;
    private List<EdgeCase> edgeCases;

    public Suggestion() {}

    public Suggestion(String methodSignature, List<EdgeCase> edgeCases) {
        this.methodSignature = methodSignature;
        // Optionally extract just the name from the signature for a cleaner UI title
        this.targetMethodName = methodSignature.contains("(") 
                ? methodSignature.substring(0, methodSignature.indexOf('(')).trim() 
                : methodSignature;
        this.edgeCases = edgeCases;
    }

    public String getTargetMethodName() { return targetMethodName; }
    public void setTargetMethodName(String targetMethodName) { this.targetMethodName = targetMethodName; }
    public String getMethodSignature() { return methodSignature; }
    public void setMethodSignature(String methodSignature) { this.methodSignature = methodSignature; }
    public List<EdgeCase> getEdgeCases() { return edgeCases; }
    public void setEdgeCases(List<EdgeCase> edgeCases) { this.edgeCases = edgeCases; }
}