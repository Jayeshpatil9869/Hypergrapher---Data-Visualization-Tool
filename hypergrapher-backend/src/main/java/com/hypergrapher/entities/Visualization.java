package com.hypergrapher.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "visualizations")
@Data
public class Visualization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String chartType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String chartData; // JSON String

    @Lob
    @Column(columnDefinition = "TEXT")
    private String insights; // JSON String

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
