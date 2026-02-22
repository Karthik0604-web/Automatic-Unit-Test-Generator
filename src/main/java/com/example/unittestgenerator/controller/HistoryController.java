package com.example.unittestgenerator.controller;

import com.example.unittestgenerator.dto.SavedTestResponse;
import com.example.unittestgenerator.models.SavedTest;
import com.example.unittestgenerator.repository.SavedTestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
// STRICT CORS FIX: Explicitly allowing DELETE and OPTIONS preflight requests
@CrossOrigin(origins = "http://localhost:5173", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class HistoryController {

    private final SavedTestRepository savedTestRepository;

    public HistoryController(SavedTestRepository savedTestRepository) {
        this.savedTestRepository = savedTestRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<SavedTestResponse>> getUserHistory(@PathVariable Long userId) {
        List<SavedTest> savedTests = savedTestRepository.findByUserId(userId);

        List<SavedTestResponse> responseList = savedTests.stream()
                .map(test -> new SavedTestResponse(
                        test.getId(),
                        test.getSourceCode(),
                        test.getGeneratedTestCode()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    // THE DELETE ENDPOINT
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHistoryItem(@PathVariable Long id) {
        try {
            savedTestRepository.deleteById(id);
            return ResponseEntity.ok().body("Test case deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting test case: " + e.getMessage());
        }
    }
}