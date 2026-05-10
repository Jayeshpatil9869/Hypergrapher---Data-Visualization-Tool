package com.hypergrapher.repositories;

import com.hypergrapher.entities.Visualization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisualizationRepository extends JpaRepository<Visualization, Long> {
    List<Visualization> findAllByOrderByCreatedAtDesc();
    List<Visualization> findByUserOrderByCreatedAtDesc(com.hypergrapher.entities.User user);
}
