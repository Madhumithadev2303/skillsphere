package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.model.UserStats;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public User loginOrRegister(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String role = payload.get("role");

        User existing = userRepository.findByUsername(username);
        if (existing != null) {
            return existing;
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setRole(role);

        UserStats stats = new UserStats();
        newUser.setStats(stats);

        return userRepository.save(newUser);
    }
}
