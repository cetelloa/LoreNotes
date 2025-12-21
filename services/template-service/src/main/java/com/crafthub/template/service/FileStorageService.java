package com.crafthub.template.service;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSUploadOptions;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class FileStorageService {

    private final GridFSBucket gridFSBucket;

    @Autowired
    public FileStorageService(MongoDatabaseFactory mongoDatabaseFactory) {
        this.gridFSBucket = GridFSBuckets.create(mongoDatabaseFactory.getMongoDatabase());
    }

    /**
     * Store a file in GridFS
     * 
     * @param file     The uploaded file
     * @param fileType Type of file (image, template)
     * @return The GridFS file ID
     */
    public String storeFile(MultipartFile file, String fileType) throws IOException {
        GridFSUploadOptions options = new GridFSUploadOptions()
                .metadata(new Document()
                        .append("type", fileType)
                        .append("contentType", file.getContentType())
                        .append("size", file.getSize()));

        try (InputStream inputStream = file.getInputStream()) {
            ObjectId fileId = gridFSBucket.uploadFromStream(
                    file.getOriginalFilename(),
                    inputStream,
                    options);
            return fileId.toString();
        }
    }

    /**
     * Retrieve a file from GridFS
     * 
     * @param fileId The GridFS file ID
     * @return The file content as byte array
     */
    public byte[] getFile(String fileId) throws IOException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            gridFSBucket.downloadToStream(new ObjectId(fileId), outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Delete a file from GridFS
     * 
     * @param fileId The GridFS file ID
     */
    public void deleteFile(String fileId) {
        gridFSBucket.delete(new ObjectId(fileId));
    }

    /**
     * Get the content type of a stored file
     */
    public String getContentType(String fileId) {
        return gridFSBucket.find(new Document("_id", new ObjectId(fileId)))
                .first()
                .getMetadata()
                .getString("contentType");
    }
}
