package com.example.unittestgenerator.controller;

import com.example.unittestgenerator.dto.GenerateRequest;
import com.example.unittestgenerator.dto.GenerateResponse;
import com.example.unittestgenerator.models.SavedTest;
import com.example.unittestgenerator.models.User;
import com.example.unittestgenerator.repository.SavedTestRepository;
import com.example.unittestgenerator.repository.UserRepository;
import com.example.unittestgenerator.service.GeneratorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class GeneratorController {

    private final GeneratorService generatorService;
    private final SavedTestRepository savedTestRepository;
    private final UserRepository userRepository;

    public GeneratorController(GeneratorService generatorService, 
                               SavedTestRepository savedTestRepository, 
                               UserRepository userRepository) {
        this.generatorService = generatorService;
        this.savedTestRepository = savedTestRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateTest(@RequestBody GenerateRequest request) {
        try {
            GenerateResponse response = generatorService.generate(request.getSourceCode());

            // THE SAVE LOGIC: Links the test to the user ID sent from React
            if (request.getUserId() != null) {
                Optional<User> userOpt = userRepository.findById(request.getUserId());
                if (userOpt.isPresent()) {
                    SavedTest savedTest = new SavedTest();
                    savedTest.setUser(userOpt.get());
                    savedTest.setSourceCode(request.getSourceCode());
                    savedTest.setGeneratedTestCode(response.getMainTestFileContent()); 
                    savedTestRepository.save(savedTest);
                }
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }
}