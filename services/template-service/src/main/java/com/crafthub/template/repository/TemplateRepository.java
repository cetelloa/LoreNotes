package com.crafthub.template.repository;

import com.crafthub.template.model.Template;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateRepository extends MongoRepository<Template, String> {

    List<Template> findByTitleContainingIgnoreCase(String title);

    List<Template> findByTagsContaining(String tag);

    List<Template> findByAuthor(String author);

    List<Template> findByCategory(String category);

    List<Template> findByIsActiveTrue();

    List<Template> findByAuthorId(String authorId);
}
