package com.lmh.web.service.impl;

import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Topic;
import com.lmh.web.model.User;
import com.lmh.web.repository.TopicRepository;
import com.lmh.web.service.TopicService;
import com.lmh.web.utils.mapper.topic.TopicMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {
    private final TopicRepository topicRepository;

    private final TopicMapper topicMapper;

    @Override
    public Page<TopicResponse> getTopicByUserAndLevel(TopicRequest topicRequest
            , int size, int page, String sortBy) {
        Pageable pageable = PageableUtils.createPageable(size, page, sortBy);
        Page<Topic> topicPage = topicRepository.findTopicsIncludingDefault(topicRequest.getUserRequest().getId()
                , topicRequest.getLevelRequest().getName()
                , "USER_CREATION"
                , topicRequest.getLanguageRequest().getName()
                , pageable);
        return mapToPageResponse(topicPage);
    }

    public Page<TopicResponse> mapToPageResponse(Page<Topic> topicPage) {
        List<TopicResponse> content = topicMapper.toResponseList(topicPage.getContent());
        return new PageImpl<>(content, topicPage.getPageable(), topicPage.getTotalElements());
    }
}
