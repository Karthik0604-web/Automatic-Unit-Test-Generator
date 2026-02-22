package com.example.unittestgenerator.service;

import com.example.unittestgenerator.dto.*;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.*;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GeneratorService {

    public GenerateResponse generate(String sourceCode) {
        try {
            CompilationUnit cu = StaticJavaParser.parse(sourceCode);

            ClassOrInterfaceDeclaration classDeclaration =
                    cu.findFirst(ClassOrInterfaceDeclaration.class)
                            .orElseThrow(() -> new IllegalArgumentException("No class found in source code."));

            String className = classDeclaration.getNameAsString();

            List<MethodDeclaration> methodsToTest = classDeclaration.getMethods().stream()
                            .filter(m -> m.isPublic() && !m.isConstructorDeclaration())
                            .collect(Collectors.toList());

            // THE NEW HEURISTIC ENGINE
            String mainTestFileContent = generateSmartTestFile(className, methodsToTest);
            List<Suggestion> suggestions = generateSuggestions(className, methodsToTest);

            return new GenerateResponse(mainTestFileContent, suggestions);

        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Java syntax. Could not parse the source code.");
        }
    }

    // ============================================================
    // THE NEW HEURISTIC ENGINE (SMART GENERATION)
    // ============================================================

    private String generateSmartTestFile(String className, List<MethodDeclaration> methods) {
        StringBuilder testClass = new StringBuilder();
        String testClassName = className + "Test";
        String instanceName = className.substring(0, 1).toLowerCase() + className.substring(1);

        // Advanced Professional Imports
        testClass.append("import org.junit.jupiter.api.BeforeEach;\n");
        testClass.append("import org.junit.jupiter.api.Test;\n");
        testClass.append("import org.junit.jupiter.params.ParameterizedTest;\n");
        testClass.append("import org.junit.jupiter.params.provider.CsvSource;\n");
        testClass.append("import static org.junit.jupiter.api.Assertions.*;\n\n");
        
        testClass.append(String.format("class %s {\n\n", testClassName));
        
        // Generate a @BeforeEach setup block
        testClass.append(String.format("    private %s %s;\n\n", className, instanceName));
        testClass.append("    @BeforeEach\n    void setUp() {\n");
        testClass.append(String.format("        %s = new %s();\n    }\n\n", instanceName, className));

        // Loop through methods and apply heuristics
        for (MethodDeclaration method : methods) {
            generateHappyPath(testClass, instanceName, method);
            
            if (method.getParameters().size() > 0) {
                if (canUseParameterizedTest(method)) {
                    generateParameterizedBoundaryTests(testClass, instanceName, method);
                } else {
                    generateNullEdgeCaseTests(testClass, instanceName, method);
                }
            }
        }

        testClass.append("}\n");
        return testClass.toString();
    }

    // --- Heuristic 1: The Happy Path ---
    private void generateHappyPath(StringBuilder testClass, String instanceName, MethodDeclaration method) {
        String methodName = method.getNameAsString();
        String testMethodName = "test" + capitalize(methodName) + "_HappyPath";
        
        testClass.append("    @Test\n");
        testClass.append(String.format("    void %s() {\n", testMethodName));
        
        String args = method.getParameters().stream()
                .map(p -> getHeuristicValue(p.getTypeAsString(), "POSITIVE"))
                .collect(Collectors.joining(", "));

        String methodCall = String.format("%s.%s(%s)", instanceName, methodName, args);
        appendAssertion(testClass, method.getTypeAsString(), methodCall);
        
        testClass.append("    }\n\n");
    }

    // --- Heuristic 2: Parameterized Boundary Testing (For Math/Logic) ---
    private void generateParameterizedBoundaryTests(StringBuilder testClass, String instanceName, MethodDeclaration method) {
        String methodName = method.getNameAsString();
        
        testClass.append("    @ParameterizedTest(name = \"Testing boundaries with inputs: {arguments}\")\n");
        testClass.append("    @CsvSource({\n");
        
        // Generate 4 heuristic boundary rows (Positive, Negative, Zero, Max)
        testClass.append(String.format("        \"%s\", // Positive values\n", buildCsvRow(method, "POSITIVE")));
        testClass.append(String.format("        \"%s\", // Negative values\n", buildCsvRow(method, "NEGATIVE")));
        testClass.append(String.format("        \"%s\", // Zero/Empty values\n", buildCsvRow(method, "ZERO")));
        testClass.append(String.format("        \"%s\"  // Extreme boundary values\n", buildCsvRow(method, "MAX")));
        testClass.append("    })\n");
        
        // Build the method signature matching the parameters
        String paramSignature = method.getParameters().stream()
                .map(p -> p.getTypeAsString() + " " + p.getNameAsString())
                .collect(Collectors.joining(", "));
                
        testClass.append(String.format("    void test%s_Boundaries(%s) {\n", capitalize(methodName), paramSignature));
        
        String args = method.getParameters().stream()
                .map(p -> p.getNameAsString())
                .collect(Collectors.joining(", "));
                
        String methodCall = String.format("%s.%s(%s)", instanceName, methodName, args);
        
        testClass.append("        // TODO: Update expected assertion based on your business logic\n");
        appendAssertion(testClass, method.getTypeAsString(), methodCall);
        
        testClass.append("    }\n\n");
    }

    // --- Heuristic 3: Object/Null Edge Cases ---
    private void generateNullEdgeCaseTests(StringBuilder testClass, String instanceName, MethodDeclaration method) {
        String methodName = method.getNameAsString();
        
        testClass.append("    @Test\n");
        testClass.append(String.format("    void test%s_NullInputs_ShouldThrowException() {\n", capitalize(methodName)));
        
        String args = method.getParameters().stream()
                .map(p -> p.getType().isPrimitiveType() ? getHeuristicValue(p.getTypeAsString(), "ZERO") : "null")
                .collect(Collectors.joining(", "));

        testClass.append("        assertThrows(IllegalArgumentException.class, () -> {\n");
        testClass.append(String.format("            %s.%s(%s);\n", instanceName, methodName, args));
        testClass.append("        }, \"Expected method to throw exception on null inputs\");\n");
        testClass.append("    }\n\n");
    }

    // ============================================================
    // THE HEURISTIC DICTIONARY (THE "BRAIN")
    // ============================================================

    private String buildCsvRow(MethodDeclaration method, String heuristicType) {
        return method.getParameters().stream()
                .map(p -> getHeuristicValue(p.getTypeAsString(), heuristicType).replace("\"", "")) // remove quotes for CSV
                .collect(Collectors.joining(", "));
    }

    private String getHeuristicValue(String type, String heuristicType) {
        return switch (type) {
            case "int", "long", "short" -> switch (heuristicType) {
                case "POSITIVE" -> "5";
                case "NEGATIVE" -> "-5";
                case "ZERO" -> "0";
                case "MAX" -> "2147483647";
                default -> "0";
            };
            case "double", "float" -> switch (heuristicType) {
                case "POSITIVE" -> "5.5";
                case "NEGATIVE" -> "-5.5";
                case "ZERO" -> "0.0";
                case "MAX" -> "99999.99";
                default -> "0.0";
            };
            case "boolean" -> heuristicType.equals("ZERO") ? "false" : "true";
            case "String" -> switch (heuristicType) {
                case "POSITIVE" -> "\"valid_string\"";
                case "NEGATIVE" -> "\"!@#$%^&*()\"";
                case "ZERO" -> "\"\"";
                case "MAX" -> "\"a_very_long_string_exceeding_standard_limits\"";
                default -> "\"\"";
            };
            default -> "null";
        };
    }

    private boolean canUseParameterizedTest(MethodDeclaration method) {
        // CsvSource works best with primitives and Strings.
        return method.getParameters().stream().allMatch(p -> 
            p.getType().isPrimitiveType() || p.getTypeAsString().equals("String")
        );
    }

    private void appendAssertion(StringBuilder testClass, String returnType, String methodCall) {
        switch (returnType) {
            case "void" -> testClass.append(String.format("        %s;\n", methodCall));
            case "boolean" -> testClass.append(String.format("        assertNotNull(%s);\n", methodCall));
            default -> testClass.append(String.format("        assertNotNull(%s, \"Result should not be null\");\n", methodCall));
        }
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    // ============================================================
    // SUGGESTIONS LOGIC (Kept intact to feed your UI Accordion)
    // ============================================================
    private List<Suggestion> generateSuggestions(String className, List<MethodDeclaration> methods) {
        List<Suggestion> suggestions = new ArrayList<>();
        // ... (Keep your exact existing generateSuggestions logic here to feed the frontend UI) ...
        return suggestions;
    }
}