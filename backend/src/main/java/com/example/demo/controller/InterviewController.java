package com.example.demo.controller;

import com.example.demo.model.InterviewResult;
import com.example.demo.model.User;
import com.example.demo.model.UserStats;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/interview")
@CrossOrigin("*")
public class InterviewController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/generate")
    public Map<String, Object> generateQuestion(@RequestBody Map<String, Object> payload) {
        String skill = payload.getOrDefault("skill", "Java").toString();
        String difficulty = payload.getOrDefault("difficulty", "Mid-Level").toString();
        String type = payload.getOrDefault("type", "Technical Core").toString();

        int count = 3;
        try {
            if (payload.containsKey("count")) {
                count = Integer.parseInt(payload.get("count").toString());
            }
        } catch (Exception e) {
        }

        List<String> questions = new java.util.ArrayList<>();

        if ("Behavioral".equalsIgnoreCase(type)) {
            questions.add("Tell me about a time you had a conflict regarding **" + skill + "** and resolved it.");
            questions.add("Describe a situation where you had to learn **" + skill + "** quickly. How did you adapt?");
            questions.add("How do you handle missing a critical deadline when building a **" + skill + "** project?");
        } else if ("System Design".equalsIgnoreCase(type)) {
            if ("Cloud".equalsIgnoreCase(skill)) {
                questions.add("Design a multi-region active-active architecture on AWS/GCP for a **" + difficulty
                        + "** global platform.");
                questions.add("How would you ensure minimum latency and high availability in a **" + difficulty
                        + "** cloud deployment?");
                questions.add(
                        "Explain how you would migrate a legacy monolithic application to a microservices architecture in the cloud.");
            } else if ("Data Science".equalsIgnoreCase(skill)) {
                questions.add("Design the architecture for an end-to-end real-time recommendation engine.");
                questions.add("How do you handle model decay and retraining pipelines in a **" + difficulty
                        + "** ML system?");
                questions.add(
                        "Explain how you would serve a complex PyTorch model to millions of users with low latency.");
            } else {
                questions.add("Design a high-concurrency architecture using **" + skill + "** for a global platform.");
                questions.add("How would you ensure high availability and fault tolerance in a **" + difficulty + " "
                        + skill + "** system?");
                questions.add(
                        "Explain how you would scale a monolithic **" + skill + "** application into microservices.");
            }
        } else if ("Data Structures".equalsIgnoreCase(type)) {
            if ("Data Science".equalsIgnoreCase(skill) || "Python".equalsIgnoreCase(skill)) {
                questions.add(
                        "How would you implement a highly optimized matrix multiplication algorithm from scratch?");
                questions
                        .add("Explain the time complexity differences between standard Python lists and Numpy arrays.");
                questions.add(
                        "Write a conceptual pseudo-algorithm to find the K most frequent elements in a massive dataset.");
            } else {
                questions.add("How would you implement a highly optimized caching mechanism using core **" + skill
                        + "** data structures?");
                questions.add(
                        "Explain the time complexity differences between hash maps and tree-based maps in the context of **"
                                + skill + "**.");
                questions.add("Write a conceptual pseudo-algorithm to detect a cycle in a strictly typed **" + skill
                        + "** linked list.");
            }
        } else {
            // Technical Core
            if ("Python".equalsIgnoreCase(skill)) {
                questions.add("Explain the Global Interpreter Lock (GIL) in Python. How does it affect **" + difficulty
                        + "** multithreading?");
                questions.add("What are decorators, and how would you use them to implement API rate limiting?");
                questions.add("Describe duck typing and how you ensure type safety in large Python codebases.");
            } else if ("C++".equalsIgnoreCase(skill)) {
                questions.add("Explain the differences between std::unique_ptr, std::shared_ptr, and std::weak_ptr.");
                questions.add("What is the Rule of Five in C++? Why is it important for **" + difficulty
                        + "** embedded systems?");
                questions.add("Describe a scenario where you would use a virtual destructor.");
            } else if ("Data Science".equalsIgnoreCase(skill)) {
                questions.add("Explain the difference between L1 (Lasso) and L2 (Ridge) regularization.");
                questions.add("How do you handle severe class imbalance in a dataset for a **" + difficulty
                        + "** classification model?");
                questions.add("Describe the bias-variance tradeoff and how you optimize for it.");
            } else {
                questions.add("Explain the concept of Dependency Injection in **" + skill
                        + "** and provide a real-world use case.");
                questions.add("What are the performance implications of using **" + skill + "** efficiently at the **"
                        + difficulty + "** scale?");
                questions.add("Describe a complex threading or caching scenario in **" + skill
                        + "** and how you would architect a solution.");
            }
        }

        while (questions.size() < count) {
            questions.add("Provide an advanced implementation example for " + skill + " " + type);
        }

        // Truncate if larger
        if (questions.size() > count) {
            questions = questions.subList(0, count);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("questions", questions);
        return response;
    }

    @PostMapping("/evaluate")
    public Map<String, Object> evaluateAnswer(@RequestBody Map<String, Object> payload) {
        // payload keys: userId, question, answer, skill

        Long userId = Long.valueOf(payload.get("userId").toString());
        String answer = payload.get("answer").toString();
        String skill = payload.get("skill").toString();

        Random rand = new Random();
        int answerLength = answer.length();
        int score = 60 + rand.nextInt(41); // random score 60-100

        if (answerLength < 20) {
            score = 30 + rand.nextInt(30);
        } else if (answerLength > 150) {
            score = 80 + rand.nextInt(21);
        }

        String feedback = score > 75
                ? "Excellent explanation! You covered most of the important concepts accurately."
                : "Your answer lacks depth. Make sure to discuss the " + skill + " mechanics in more detail.";

        String idealResponse = "A complete response addresses memory layouts in " + skill
                + ", gives a code or syntax example, and mentions trade-offs such as execution speed versus memory overhead.";

        // Save to DB
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            InterviewResult ir = new InterviewResult();
            ir.setSkill(skill);
            ir.setScore(score);
            ir.setFeedback(feedback);
            ir.setIdealResponse(idealResponse);
            ir.setUser(user);
            user.getInterviewHistory().add(ir);

            // Update stats
            UserStats stats = user.getStats();
            stats.setInterviews(stats.getInterviews() + 1);
            stats.getHistory().add(score);

            int total = 0;
            for (int s : stats.getHistory()) {
                total += s;
            }
            stats.setAverageScore(total / stats.getInterviews());
            stats.setReadiness((int) Math.min(100, stats.getAverageScore() + (stats.getInterviews() * 2)));
            stats.setStrongest(skill); // Simplified

            userRepository.save(user);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("score", score);
        response.put("feedback", feedback);
        response.put("idealResponse", idealResponse);
        if (user != null) {
            response.put("updatedStats", user.getStats());
        }

        return response;
    }
}
