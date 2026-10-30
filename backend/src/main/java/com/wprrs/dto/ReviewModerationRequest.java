package com.wprrs.dto;

import com.wprrs.entity.ModerationAction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReviewModerationRequest {

    @NotNull(message = "Moderation action is required (APPROVED, REJECTED, FLAGGED)")
    private ModerationAction action;

    @Size(max = 1000, message = "Comments cannot exceed 1000 characters")
    private String comments;

    public ReviewModerationRequest() {}

    public ReviewModerationRequest(ModerationAction action, String comments) {
        this.action = action;
        this.comments = comments;
    }

    public ModerationAction getAction() {
        return action;
    }

    public void setAction(ModerationAction action) {
        this.action = action;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
