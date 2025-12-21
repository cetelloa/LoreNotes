package com.crafthub.template.controller;

import com.crafthub.template.model.Template;
import com.crafthub.template.repository.TemplateRepository;
import com.crafthub.template.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*")
public class TemplateController {

    @Autowired
    private TemplateRepository templateRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // ========== PUBLIC ENDPOINTS ==========

    @GetMapping
    public List<Template> getAllTemplates() {
        return templateRepository.findByIsActiveTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Template> getTemplateById(@PathVariable String id) {
        Optional<Template> template = templateRepository.findById(id);
        return template.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<Template> searchTemplates(@RequestParam String query) {
        return templateRepository.findByTitleContainingIgnoreCase(query);
    }

    @GetMapping("/category/{category}")
    public List<Template> getByCategory(@PathVariable String category) {
        return templateRepository.findByCategory(category);
    }

    // ========== FILE DOWNLOAD ENDPOINTS ==========

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getTemplateImage(@PathVariable String id) {
        try {
            Optional<Template> template = templateRepository.findById(id);
            if (template.isEmpty() || template.get().getImageFileId() == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] imageData = fileStorageService.getFile(template.get().getImageFileId());
            String contentType = fileStorageService.getContentType(template.get().getImageFileId());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(imageData);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadTemplate(@PathVariable String id) {
        try {
            Optional<Template> templateOpt = templateRepository.findById(id);
            if (templateOpt.isEmpty() || templateOpt.get().getTemplateFileId() == null) {
                return ResponseEntity.notFound().build();
            }

            Template template = templateOpt.get();
            byte[] fileData = fileStorageService.getFile(template.getTemplateFileId());

            // Increment download count
            template.setDownloadCount((template.getDownloadCount() != null ? template.getDownloadCount() : 0) + 1);
            templateRepository.save(template);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + template.getFileName() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(fileData);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createTemplate(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("purpose") String purpose,
            @RequestParam("price") Double price,
            @RequestParam("author") String author,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam("templateFile") MultipartFile templateFile) {
        try {
            // Validate file types
            if (!isValidImageType(imageFile.getContentType())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formato de imagen no válido"));
            }
            if (!isValidTemplateType(templateFile.getOriginalFilename())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Formato de plantilla no válido. Use PDF."));
            }

            // Store files in GridFS
            String imageFileId = fileStorageService.storeFile(imageFile, "image");
            String templateFileId = fileStorageService.storeFile(templateFile, "template");

            // Create template
            Template template = new Template();
            template.setTitle(title);
            template.setDescription(description);
            template.setPurpose(purpose);
            template.setPrice(price);
            template.setAuthor(author);
            template.setCategory(category);
            template.setTags(tags);
            template.setImageFileId(imageFileId);
            template.setTemplateFileId(templateFileId);
            template.setFileName(templateFile.getOriginalFilename());
            template.setFileFormat(getFileExtension(templateFile.getOriginalFilename()));
            template.setFileSize(templateFile.getSize());
            template.setRating(0);
            template.setDownloadCount(0);
            template.setIsActive(true);
            template.setCreatedAt(LocalDateTime.now());
            template.setUpdatedAt(LocalDateTime.now());

            Template saved = templateRepository.save(template);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar archivos: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTemplate(
            @PathVariable String id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "purpose", required = false) String purpose,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "templateFile", required = false) MultipartFile templateFile) {
        try {
            Optional<Template> templateOpt = templateRepository.findById(id);
            if (templateOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Template template = templateOpt.get();

            if (title != null)
                template.setTitle(title);
            if (description != null)
                template.setDescription(description);
            if (purpose != null)
                template.setPurpose(purpose);
            if (price != null)
                template.setPrice(price);
            if (category != null)
                template.setCategory(category);

            // Update image if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                if (template.getImageFileId() != null) {
                    fileStorageService.deleteFile(template.getImageFileId());
                }
                String newImageId = fileStorageService.storeFile(imageFile, "image");
                template.setImageFileId(newImageId);
            }

            // Update template file if provided
            if (templateFile != null && !templateFile.isEmpty()) {
                if (template.getTemplateFileId() != null) {
                    fileStorageService.deleteFile(template.getTemplateFileId());
                }
                String newFileId = fileStorageService.storeFile(templateFile, "template");
                template.setTemplateFileId(newFileId);
                template.setFileName(templateFile.getOriginalFilename());
                template.setFileFormat(getFileExtension(templateFile.getOriginalFilename()));
                template.setFileSize(templateFile.getSize());
            }

            template.setUpdatedAt(LocalDateTime.now());
            Template saved = templateRepository.save(template);
            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al actualizar: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable String id) {
        Optional<Template> templateOpt = templateRepository.findById(id);
        if (templateOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Template template = templateOpt.get();

        // Delete associated files
        if (template.getImageFileId() != null) {
            fileStorageService.deleteFile(template.getImageFileId());
        }
        if (template.getTemplateFileId() != null) {
            fileStorageService.deleteFile(template.getTemplateFileId());
        }

        templateRepository.delete(template);
        return ResponseEntity.ok(Map.of("message", "Plantilla eliminada"));
    }

    // ========== HELPER METHODS ==========

    private boolean isValidImageType(String contentType) {
        return contentType != null && (contentType.equals("image/jpeg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif") ||
                contentType.equals("image/webp"));
    }

    private boolean isValidTemplateType(String filename) {
        if (filename == null)
            return false;
        String ext = getFileExtension(filename).toLowerCase();
        return ext.equals("pdf") || ext.equals("docx") || ext.equals("pptx") || ext.equals("xlsx");
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }
}
