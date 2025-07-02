package com.lmh.web.service;

import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface TopicService {
    Page<TopicResponse> getTopicByUserAndLevel(TopicRequest topicRequest
            , int size, int page, String sortBy);
}
