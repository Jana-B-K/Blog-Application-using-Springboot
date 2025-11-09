package com.example.blog.controller;

import com.example.blog.model.Post;
import com.example.blog.repository.PostRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostRepository postRepository;

    public PostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @GetMapping
    public List<Post> getAll() {
        return postRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Post> getById(@PathVariable Long id) {
        return postRepository.findById(id);
    }

    @PostMapping
    public Post create(@RequestBody Post post) {
        post.setDate(LocalDateTime.now());
        return postRepository.save(post);
    }

    @PutMapping("/{id}")
    public Post update(@PathVariable Long id, @RequestBody Post updated) {
        return postRepository.findById(id).map(p -> {
            p.setAuthor(updated.getAuthor());
            p.setContent(updated.getContent());
            // keep date as now
            p.setDate(LocalDateTime.now());
            return postRepository.save(p);
        }).orElseThrow(() -> new RuntimeException("Post not found"));
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable Long id) {
        postRepository.deleteById(id);
    }

    @DeleteMapping
    public void deleteAll() {
        postRepository.deleteAll();
    }
}