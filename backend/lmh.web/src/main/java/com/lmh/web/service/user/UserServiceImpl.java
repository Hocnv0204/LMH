package com.lmh.web.service.user;

import com.lmh.web.common.exception.NotFoundException;
import com.lmh.web.dto.request.user.UserRequest;
import com.lmh.web.dto.response.user.UserDto;
import com.lmh.web.dto.response.user.UserResponse;
import com.lmh.web.model.User;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.utils.mapper.user.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    private final UserMapper userMapper;


    @Override
    public User getUserByUsername(String username) {
        log.debug("Tìm kiếm user theo username: {}", username);
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isEmpty()){
            log.warn("Không tìm thấy user với username: {}", username);
            throw new NotFoundException("Not found user - " + username);
        }
        log.debug("Tìm thấy user với username: {}", username);
        return userOptional.get();
    }

    @Override
    public User getUserById(Integer id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null){
            log.warn("Không tìm thấy user với id: {}", id);
            throw new NotFoundException("Not found user - " + id);
        }
        return user;
    }

    @Override
    public UserResponse updateUser(Integer id, UserRequest userRequest) {
        log.info("Bắt đầu cập nhật thông tin user ID: {}", id);
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            log.warn("Cập nhật user thất bại: Không tìm thấy user với ID: {}", id);
            throw new NotFoundException("Not found user with id - " + id);
        }
        User user = userOptional.get();
        user.setName(userRequest.getName());
        user.setEmail(userRequest.getEmail());
        user.setPhoneNumber(userRequest.getPhoneNumber());
        user.setDateOfBirth(userRequest.getDateOfBirth());
        user.setSchool(userRequest.getSchool());
        
        UserResponse result = userMapper.toResponse(userRepository.save(user));
        log.info("Cập nhật thông tin user thành công ID: {}, tên: {}", id, userRequest.getName());
        return result;
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable){
        Page<User> pages = userRepository.findAll(pageable) ;
        Page<UserResponse> pagesResponse = pages.map(userMapper::toResponse) ;
        return pagesResponse ;
    }
}
