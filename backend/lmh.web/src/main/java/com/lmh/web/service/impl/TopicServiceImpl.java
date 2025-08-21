package com.lmh.web.service.impl;

import com.lmh.web.common.constant.TypeTopic;
import com.lmh.web.common.exception.DataExistedException;
import com.lmh.web.common.exception.InvalidDataException;
import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.common.utils.PageableUtils;
import com.lmh.web.dto.request.topic.TopicRequest;
import com.lmh.web.dto.request.topic.UpdateTopicUser;
import com.lmh.web.dto.response.topic.AdminTopicResponse;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {
    private final UserService userService;

    private final LanguageService languageService;

    private final LevelService levelService;

    private final TopicRepository topicRepository;

    private final TopicMapper topicMapper;

    @Override
    public Page<TopicResponse> getTopicByUserAndLevel(Integer userId, String languageName, String levelName
            , int size, int page, String sortBy) {
        log.info("Lấy danh sách topic cho user ID: {}, ngôn ngữ: {}, level: {}", userId, languageName, levelName);
        Pageable pageable = PageableUtils.createPageable(size, page, sortBy);
        Page<Topic> topicPage = topicRepository.findTopicsIncludingDefault(userId
                , levelName
                , TypeTopic.USER_CREATION
                , languageName
                , pageable);
        log.info("Lấy danh sách topic thành công: {} topic được tìm thấy", topicPage.getTotalElements());
        return mapToPageResponse(topicPage);
    }

    @Override
    public TopicResponse addTopicUser(String username, TopicRequest topicRequest) {
        log.info("Bắt đầu thêm topic mới cho user: {}, tên topic: {}", username, topicRequest.getName());
        User user = userService.getUserByUsername(username);
        Language language = languageService.findByName(topicRequest.getLanguageRequest().getName());
        Level level = levelService.findByName(topicRequest.getLevelRequest().getName());
        boolean isExistLevelName = topicRepository.existsByName(topicRequest.getName());
        if (isExistLevelName){
            log.warn("Thêm topic thất bại: Topic đã tồn tại - {}", topicRequest.getName());
            throw new DataExistedException("Existed name topic - " + topicRequest.getName());
        }
        Topic topic = topicMapper.toEntity(topicRequest);
        topic.setLanguage(language);
        topic.setUser(user);
        topic.setLevel(level);
        topic.setType(TypeTopic.USER_CREATION);
        topic.setDeleteFlag(false);
        TopicResponse result = topicMapper.toResponse(topicRepository.save(topic));
        log.info("Thêm topic thành công cho user: {}, tên topic: {}, ID: {}", username, topicRequest.getName(), result.getId());
        return result;
    }

    @Override
    public void deleteTopicUser(String username, String topicName) {
        log.info("Bắt đầu xóa topic: {} cho user: {}", topicName, username);
        Topic topic = findByName(topicName);
        User user = userService.getUserByUsername(username);
        if (topic.getType().equals(TypeTopic.DEFAULT)){
            log.warn("Xóa topic thất bại: Không thể xóa topic mặc định - {}", topicName);
            throw new InvalidDataException("Cannot delete topic default");
        }

        if (user.equals(topic.getUser())){
            log.warn("Xóa topic thất bại: Topic không thuộc về user - {} - topic: {}", username, topicName);
            throw new InvalidDataException("Topic not belong user - " + username + " - topic name - " + topicName);
        }
        topicRepository.delete(topic);
        log.info("Xóa topic thành công: {} cho user: {}", topicName, username);
    }

    @Override
    public TopicResponse updateTopicUser(String username, UpdateTopicUser updateTopicUser) {
        log.info("Bắt đầu cập nhật topic: {} cho user: {}", updateTopicUser.getName(), username);
        Topic topic = findByName(updateTopicUser.getName());
        if (topic.getType().equals(TypeTopic.DEFAULT)){
            log.warn("Cập nhật topic thất bại: Không thể cập nhật topic mặc định - {}", updateTopicUser.getName());
            throw new InvalidDataException("Cannot update topic default");
        }
        User user = userService.getUserByUsername(username);
        if (!user.getEmail().equals(topic.getUser().getEmail())){
            log.warn("Cập nhật topic thất bại: Topic không thuộc về user - {} - topic: {}", username, updateTopicUser.getName());
            throw new InvalidDataException("Topic not belong user - " + username + " - topic name - " + updateTopicUser.getName() + " - " + topic.getUser().getName());
        }
        topic.setName(updateTopicUser.getName());
        topic.setDescription(updateTopicUser.getDescription());
        TopicResponse result = topicMapper.toResponse(topicRepository.save(topic));
        log.info("Cập nhật topic thành công: {} cho user: {}, ID: {}", updateTopicUser.getName(), username, result.getId());
        return result;
    }

    public Topic findByName(String topicName){
        log.debug("Tìm kiếm topic theo tên: {}", topicName);
        Optional<Topic> topicOptional = topicRepository.findByName(topicName);
        if (topicOptional.isEmpty()){
            log.warn("Không tìm thấy topic: {}", topicName);
            throw new NotFoundException("Not found topic - " + topicName);
        }
        log.debug("Tìm thấy topic: {}", topicName);
        return topicOptional.get();
    }

    public Page<TopicResponse> mapToPageResponse(Page<Topic> topicPage) {
        List<TopicResponse> content = topicMapper.toResponseList(topicPage.getContent());
        return new PageImpl<>(content, topicPage.getPageable(), topicPage.getTotalElements());
    }
}
