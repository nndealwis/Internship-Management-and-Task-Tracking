package com.nimesh.internship_management.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    private String comment;

    private FeedbackDecision decision;

    private LocalDate date;

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public FeedbackDecision getDecision() {
        return decision;
    }

    public void setDecision(FeedbackDecision decision) {
        this.decision = decision;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

}