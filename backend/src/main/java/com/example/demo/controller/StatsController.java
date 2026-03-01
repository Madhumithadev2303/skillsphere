package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin("*")
public class StatsController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{userId}")
    public Object getStats(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            return user.getStats();
        }
        return null;
    }
}
