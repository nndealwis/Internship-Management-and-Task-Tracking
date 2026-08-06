package com.nimesh.internship_management.dto;

import com.nimesh.internship_management.model.Project;
import com.nimesh.internship_management.model.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private long totalUsers;
    private long totalProjects;
    private long totalTasks;
    private long completedTasks;
    private long inProgressTasks;
    private long todoTasks;
    private long totalWorkLogs;
    private List<Project> recentProjects;
    private List<Task> recentTasks;
}
