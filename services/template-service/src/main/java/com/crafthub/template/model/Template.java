package com.crafthub.template.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "templates")
public class Template {

    @Id
    private String id;

    private String title;
    private String description;
    private String purpose; // What the template is for (e.g., "Invitaciones de boda")
    private Double price;
    private String author;
    private String authorId; // User ID of creator
    private List<String> tags;
    private String category;

    // File storage - GridFS file IDs
    private String imageFileId; // Preview image stored in GridFS
    private String templateFileId; // PDF/template file stored in GridFS
    private String fileName; // Original filename
    private String fileFormat; // pdf, docx, etc.
    private Long fileSize; // File size in bytes

    private Integer rating;
    private Integer downloadCount;
    private Boolean isActive;
    private String tutorialVideoUrl; // URL to TikTok/Instagram tutorial video
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
