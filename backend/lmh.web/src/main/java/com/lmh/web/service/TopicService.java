package com.lmh.web.service;

import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicUser;
import com.lmh.web.dto.response.topic.AdminTopicResponse;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Topic;
import com.lmh.web.model.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface TopicService {
    Page<TopicResponse> getTopicByUserAndLevel(TopicRequest topicRequest
            , int size, int page, String sortBy);
    TopicResponse addTopicUser(String username, TopicRequest topicRequest);
    void deleteTopicUser(String username, String topicName);
    TopicResponse updateTopicUser(String username, UpdateTopicUser updateTopicUser);
    Topic findByName(String topicName);
}