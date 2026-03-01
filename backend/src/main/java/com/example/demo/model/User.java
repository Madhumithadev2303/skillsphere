package com.example.demo.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String role; // e.g. "Java Developer"

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "stats_id", referencedColumnName = "id")
    private UserStats stats;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InterviewResult> interviewHistory = new ArrayList<>();

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public UserStats getStats() {
        return stats;
    }

    public void setStats(UserStats stats) {
        this.stats = stats;
    }

    public List<InterviewResult> getInterviewHistory() {
        return interviewHistory;
    }

    public void setInterviewHistory(List<InterviewResult> interviewHistory) {
        this.interviewHistory = interviewHistory;
    }
}
