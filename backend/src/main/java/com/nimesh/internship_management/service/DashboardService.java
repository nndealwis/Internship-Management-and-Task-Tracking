package com.nimesh.internship_management.service;

import com.nimesh.internship_management.dto.DashboardResponse;
import com.nimesh.internship_management.model.TaskStatus;
import com.nimesh.internship_management.repository.ProjectRepository;
import com.nimesh.internship_management.repository.TaskRepository;
import com.nimesh.internship_management.repository.UserRepository;
import com.nimesh.internship_management.repository.WorkLogRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final WorkLogRepository workLogRepository;

    public DashboardService(UserRepository userRepository,
                            ProjectRepository projectRepository,
                            TaskRepository taskRepository,
                            WorkLogRepository workLogRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.workLogRepository = workLogRepository;
    }

    public DashboardResponse getDashboard() {
        return DashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalProjects(projectRepository.count())
                .totalTasks(taskRepository.count())
                .completedTasks(taskRepository.countByStatus(TaskStatus.COMPLETED))
                .inProgressTasks(taskRepository.countByStatus(TaskStatus.IN_PROGRESS))
                .todoTasks(taskRepository.countByStatus(TaskStatus.TODO))
                .totalWorkLogs(workLogRepository.count())
                .recentProjects(projectRepository.findAll(
                        PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"))
                ).getContent())
                .recentTasks(taskRepository.findAll(
                        PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"))
                ).getContent())
                .build();
    }
}
