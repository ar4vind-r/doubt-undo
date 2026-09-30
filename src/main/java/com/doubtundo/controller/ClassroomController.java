package com.doubtundo.controller;

import com.doubtundo.model.Classroom;
import com.doubtundo.model.Doubt;
import com.doubtundo.service.ClassroomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping
@CrossOrigin(origins = "*")
public class ClassroomController {

    private final ClassroomService classroomService;
    private final Path uploadPath;

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
        this.uploadPath = Paths.get("server", "uploads").toAbsolutePath();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * REST Endpoint: GET /api/session/{code}
     * Returns full classroom details for JSON export or session inspection.
     */
    @GetMapping("/api/session/{code}")
    public ResponseEntity<Map<String, Object>> getSessionData(@PathVariable String code) {
        Classroom session = classroomService.getClassroomOrThrow(code);

        List<Map<String, Object>> doubtList = new ArrayList<>();
        for (Doubt d : session.getDoubts()) {
            Map<String, Object> dMap = new LinkedHashMap<>();
            dMap.put("id", d.getId());
            dMap.put("handle", d.getAuthor().displayName());
            dMap.put("text", d.getText());
            dMap.put("mediaUrl", d.getMediaUrl());
            dMap.put("mediaType", d.getMediaType());
            dMap.put("upvotes", d.getVotes());
            dMap.put("status", d.getStatus());
            dMap.put("teacherReply", d.getAnswers().isEmpty() ? null : d.getAnswers().get(0).getText());
            dMap.put("createdAt", d.getTimestamp());
            doubtList.add(dMap);
        }

        Map<String, Object> exportData = new LinkedHashMap<>();
        exportData.put("code", session.getRoomCode());
        exportData.put("createdAt", session.getCreatedAt());
        exportData.put("endedAt", session.getEndedAt());
        exportData.put("isEnded", session.isEnded());
        exportData.put("participantCount", session.getStudents().size() + 1);
        exportData.put("totalDoubts", session.getDoubts().size());
        exportData.put("doubts", doubtList);

        return ResponseEntity.ok(exportData);
    }

    /**
     * REST Endpoint: POST /api/upload
     * Handles media uploads (images, audio, video).
     */
    @PostMapping("/api/upload")
    public ResponseEntity<Map<String, Object>> uploadMedia(@RequestParam("media") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No media file provided"));
        }

        try {
            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            } else {
                ext = ".bin";
            }

            String uniqueName = System.currentTimeMillis() + "-" + Math.abs(new Random().nextInt(1000000000)) + ext;
            Path targetLocation = uploadPath.resolve(uniqueName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String contentType = file.getContentType() != null ? file.getContentType() : "";
            String mediaType = contentType.startsWith("video/") ? "video" :
                               contentType.startsWith("audio/") ? "audio" : "image";

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mediaUrl", "/uploads/" + uniqueName);
            response.put("mediaType", mediaType);
            response.put("originalName", originalName);

            return ResponseEntity.ok(response);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to store media file: " + ex.getMessage()));
        }
    }
}
