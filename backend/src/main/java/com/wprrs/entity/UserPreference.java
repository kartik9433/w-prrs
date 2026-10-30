package com.wprrs.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "user_preferences",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_pref_key", columnNames = {"user_id", "preference_key"})
    },
    indexes = {
        @Index(name = "idx_user_preferences_user", columnList = "user_id")
    }
)
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_preference_id")
    private Long userPreferenceId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user_preferences_user"))
    @JsonIgnoreProperties({"reviews", "preferences", "password", "hibernateLazyInitializer", "handler"})
    private User user;

    @NotBlank
    @Column(name = "preference_key", nullable = false, length = 100)
    private String preferenceKey;

    @NotBlank
    @Column(name = "preference_value", nullable = false, length = 255)
    private String preferenceValue;

    public UserPreference() {}

    public UserPreference(User user, String preferenceKey, String preferenceValue) {
        this.user = user;
        this.preferenceKey = preferenceKey;
        this.preferenceValue = preferenceValue;
    }

    public Long getUserPreferenceId() {
        return userPreferenceId;
    }

    public void setUserPreferenceId(Long userPreferenceId) {
        this.userPreferenceId = userPreferenceId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPreferenceKey() {
        return preferenceKey;
    }

    public void setPreferenceKey(String preferenceKey) {
        this.preferenceKey = preferenceKey;
    }

    public String getPreferenceValue() {
        return preferenceValue;
    }

    public void setPreferenceValue(String preferenceValue) {
        this.preferenceValue = preferenceValue;
    }
}
