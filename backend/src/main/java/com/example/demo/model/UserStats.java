package com.example.demo.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_stats")
public class UserStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int interviews = 0;
    private int averageScore = 0;
    private int readiness = 0;
    private String strongest = "-";

    @ElementCollection
    private List<Integer> history = new ArrayList<>();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getInterviews() {
        return interviews;
    }

    public void setInterviews(int interviews) {
        this.interviews = interviews;
    }

    public int getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(int averageScore) {
        this.averageScore = averageScore;
    }

    public int getReadiness() {
        return readiness;
    }

    public void setReadiness(int readiness) {
        this.readiness = readiness;
    }

    public String getStrongest() {
        return strongest;
    }

    public void setStrongest(String strongest) {
        this.strongest = strongest;
    }

    public List<Integer> getHistory() {
        return history;
    }

    public void setHistory(List<Integer> history) {
        this.history = history;
    }
}
