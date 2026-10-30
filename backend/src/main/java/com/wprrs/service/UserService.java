package com.wprrs.service;

import com.wprrs.entity.User;
import com.wprrs.entity.UserPreference;
import com.wprrs.exception.ResourceNotFoundException;
import com.wprrs.repository.UserPreferenceRepository;
import com.wprrs.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    public UserService(UserRepository userRepository, UserPreferenceRepository userPreferenceRepository) {
        this.userRepository = userRepository;
        this.userPreferenceRepository = userPreferenceRepository;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    public List<UserPreference> getUserPreferences(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return userPreferenceRepository.findByUserUserId(userId);
    }

    @Transactional
    public UserPreference saveOrUpdatePreference(Long userId, String key, String value) {
        User user = getUserById(userId);
        Optional<UserPreference> existing = userPreferenceRepository.findByUserUserIdAndPreferenceKey(userId, key);

        UserPreference preference;
        if (existing.isPresent()) {
            preference = existing.get();
            preference.setPreferenceValue(value);
        } else {
            preference = new UserPreference(user, key, value);
        }

        return userPreferenceRepository.save(preference);
    }
}
