package com.lmh.web.service.impl;

import com.lmh.web.common.constant.TypeTopic;
import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.InvalidDataException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicUser;
import com.lmh.web.dto.response.topic.TopicResponse;
import com.lmh.web.model.Language;
import com.lmh.web.model.Level;
import com.lmh.web.model.Topic;
import com.lmh.web.model.User;
import com.lmh.web.repository.TopicRepository;
import com.lmh.web.service.LanguageService;
import com.lmh.web.service.LevelService;
import com.lmh.web.service.TopicService;
import com.lmh.web.service.UserService;
import com.lmh.web.utils.mapper.topic.TopicMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {
    private final UserService userService;

    private final LanguageService languageService;

    private final LevelService levelService;

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

    @Override
    public TopicResponse addTopicUser(String username, TopicRequest topicRequest) {
        User user = userService.getUserByUsername(username);
        Language language = languageService.findByName(topicRequest.getLanguageRequest().getName());
        Level level = levelService.findByName(topicRequest.getLevelRequest().getName());
        boolean isExistLevelName = topicRepository.existsByName(topicRequest.getName());
        if (isExistLevelName){
            throw new DataExistedException("Existed name topic - " + topicRequest.getName());
        }
        Topic topic = topicMapper.toEntity(topicRequest);
        topic.setLanguage(language);
        topic.setUser(user);
        topic.setLevel(level);
        topic.setType(TypeTopic.USER_CREATION);
        return topicMapper.toResponse(topicRepository.save(topic));
    }

    @Override
    public void deleteTopicUser(String username, String topicName) {
        Topic topic = findByName(topicName);
        User user = userService.getUserByUsername(username);
        if (topic.getType().equals(TypeTopic.DEFAULT)){
            throw new InvalidDataException("Cannot delete topic default");
        }
        if (user.equals(topic.getUser())){
            throw new InvalidDataException("Topic not belong user - " + username + " - topic name - " + topicName);
        }
        topicRepository.delete(topic);
    }

    @Override
    public TopicResponse updateTopicUser(String username, UpdateTopicUser updateTopicUser) {
        Topic topic = findByName(updateTopicUser.getName());
        if (topic.getType().equals(TypeTopic.DEFAULT)){
            throw new InvalidDataException("Cannot update topic default");
        }
        User user = userService.getUserByUsername(username);
        if (user.equals(topic.getUser())){
            throw new InvalidDataException("Topic not belong user - " + username + " - topic name - " + updateTopicUser.getName());
        }
        topic.setDescription(updateTopicUser.getDescription());
        Level level = levelService.findByName(updateTopicUser.getName());
        topic.setLevel(level);
        return topicMapper.toResponse(topicRepository.save(topic));
    }

    public Topic findByName(String topicName){
        Optional<Topic> topicOptional = topicRepository.findByName(topicName);
        if (topicOptional.isEmpty()){
            throw new NotFoundException("Not found topic - " + topicName);
        }
        return topicOptional.get();
    }

    public Page<TopicResponse> mapToPageResponse(Page<Topic> topicPage) {
        List<TopicResponse> content = topicMapper.toResponseList(topicPage.getContent());
        return new PageImpl<>(content, topicPage.getPageable(), topicPage.getTotalElements());
    }
}
