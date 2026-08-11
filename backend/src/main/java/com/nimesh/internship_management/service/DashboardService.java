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
    private final AuthUserService authUserService;

    public DashboardService(UserRepository userRepository,
                            ProjectRepository projectRepository,
                            TaskRepository taskRepository,
                            WorkLogRepository workLogRepository,
                            AuthUserService authUserService) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.workLogRepository = workLogRepository;
        this.authUserService = authUserService;
    }

    public DashboardResponse getDashboard() {
        if (authUserService.isAdmin()) {
            return getAdminDashboard();
        }
        return getInternDashboard();
    }

    private DashboardResponse getAdminDashboard() {
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

    private DashboardResponse getInternDashboard() {
        String userId = authUserService.getCurrentUserId();
        if (userId == null) {
            throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
        }
        var myTasks = taskRepository.findByAssignedInternId(userId);
        var myProjects = projectRepository.findByAssignedInternIdsContaining(userId);
        var myWorkLogs = workLogRepository.findByInternId(userId);

        long completedTasks = myTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long inProgressTasks = myTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long todoTasks = myTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.TODO).count();

        return DashboardResponse.builder()
                .totalUsers(0)
                .totalProjects(myProjects.size())
                .totalTasks(myTasks.size())
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .todoTasks(todoTasks)
                .totalWorkLogs(myWorkLogs.size())
                .recentProjects(myProjects.stream().limit(5).toList())
                .recentTasks(myTasks.stream().limit(5).toList())
                .build();
    }
}
