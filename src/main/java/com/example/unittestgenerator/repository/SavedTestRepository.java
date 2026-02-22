package com.example.unittestgenerator.repository;

import com.example.unittestgenerator.models.SavedTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedTestRepository extends JpaRepository<SavedTest, Long> {
    
    // Spring Boot is smart enough to write the SQL query automatically 
    // just by reading the name of this method!
    List<SavedTest> findByUserId(Long userId);
    
}