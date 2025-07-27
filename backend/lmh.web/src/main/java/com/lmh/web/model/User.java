package com.lmh.web.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(length = 100)
    private String name;
    
    @Column(length = 100, unique = true)
    private String username;
    
    @Column(length = 100, unique = true)
    private String email;
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(name = "date_birth")
    private LocalDate dateOfBirth;
    
    @Column(length = 100)
    private String school;
    
    @Column
    private String password;
    
    @Column(length = 50)
    private String role;
    
    private Integer point;
    
    private Integer credit;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "delete_flag")
    private Boolean deleteFlag;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Feedback> feedbacks;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Topic> topics;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Lesson> lessons;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vocabulary> vocabularies;
    
    @OneToMany(mappedBy = "userSender", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Notification> sentNotifications;
    
    @OneToMany(mappedBy = "userReceive", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Notification> receivedNotifications;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<History> histories;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StatusLessonUser> statusLessonUsers;

    public User() {}
   
    @Override
    public String toString() {
        return "User{" +
                "lastLogin=" + lastLogin +
                ", createdAt=" + createdAt +
                ", credit=" + credit +
                ", point=" + point +
                ", role='" + role + '\'' +
                ", password='" + password + '\'' +
                ", school='" + school + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", email='" + email + '\'' +
                ", username='" + username + '\'' +
                ", name='" + name + '\'' +
                ", id=" + id +
                '}';
    }
} 