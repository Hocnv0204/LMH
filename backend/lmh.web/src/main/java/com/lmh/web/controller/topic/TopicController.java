package com.lmh.web.controller.topic;

import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicUser;
import com.lmh.web.dto.response.CustomResponse;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Validated
public class TopicController {
    private final TopicService topicService;

    @GetMapping("/user/topic")
    public CustomResponse<?> findByUserAndLevelName(@RequestParam(defaultValue = "10") int size,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "id") String sortBy,
                                                    @RequestParam Integer userId,
                                                    @RequestParam String languageName,
                                                    @RequestParam String levelName){
        Page<TopicResponse> topic = topicService.getTopicByUserAndLevel(userId, languageName, levelName, size, page, sortBy);
        return new CustomResponse<>(topic, HttpStatus.OK);
    }

    @PostMapping("/user/topic/{username}/add-topic")
    public CustomResponse<?> addTopic(
            @PathVariable String username,
            @RequestBody TopicRequest topicRequest
    ){
        return new CustomResponse<>(topicService.addTopicUser(username, topicRequest), HttpStatus.OK);
    }

    @DeleteMapping("/user/topic/{username}/delete-topic")
    public CustomResponse<?> deleteTopic(
            @PathVariable String username,
            @RequestParam String topicName
    ){
        topicService.deleteTopicUser(username, topicName);
        return new CustomResponse<>("Delete topic successfully", HttpStatus.OK);
    }

    @PutMapping("/user/topic/{username}/update-topic")
    public CustomResponse<?> updateTopic(
            @PathVariable String username,
            @RequestBody UpdateTopicUser updateTopicUser
            ){
        return new CustomResponse<>(topicService.updateTopicUser(username, updateTopicUser));
    }

}
