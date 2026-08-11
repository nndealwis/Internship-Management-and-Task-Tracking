package com.nimesh.internship_management.service;

import com.nimesh.internship_management.exception.ForbiddenException;
import com.nimesh.internship_management.model.WorkLog;
import com.nimesh.internship_management.repository.WorkLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkLogService {

    private final WorkLogRepository workLogRepository;
    private final AuthUserService authUserService;

    public WorkLogService(WorkLogRepository workLogRepository, AuthUserService authUserService) {
        this.workLogRepository = workLogRepository;
        this.authUserService = authUserService;
    }

    public List<WorkLog> getAllWorkLogs() {
        if (authUserService.isAdmin()) {
            return workLogRepository.findAll();
        }
        String userId = authUserService.getCurrentUserId();
        if (userId == null) {
            throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
        }
        return workLogRepository.findByInternId(userId);
    }

    public WorkLog getWorkLogById(String id) {
        WorkLog workLog = workLogRepository.findById(id).orElse(null);
        if (workLog == null) return null;

        if (authUserService.isIntern()) {
            String userId = authUserService.getCurrentUserId();
            if (userId == null) {
                throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
            }
            if (!userId.equals(workLog.getInternId())) {
                throw new ForbiddenException("You can only view your own work logs");
            }
        }
        return workLog;
    }

    public WorkLog createWorkLog(WorkLog workLog) {
        String userId = authUserService.getCurrentUserId();
        if (userId == null) {
            throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
        }
        if (authUserService.isIntern()) {
            workLog.setInternId(userId);
        }
        return workLogRepository.save(workLog);
    }

    public WorkLog updateWorkLog(String id, WorkLog workLog) {
        WorkLog existingWorkLog = workLogRepository.findById(id).orElse(null);

        if (existingWorkLog == null) {
            return null;
        }

        if (authUserService.isIntern()) {
            String userId = authUserService.getCurrentUserId();
            if (userId == null) {
                throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
            }
            if (!userId.equals(existingWorkLog.getInternId())) {
                throw new ForbiddenException("You can only update your own work logs");
            }
        }

        if (authUserService.isAdmin()) {
            existingWorkLog.setInternId(workLog.getInternId());
        }
        existingWorkLog.setDate(workLog.getDate());
        existingWorkLog.setCompletedWork(workLog.getCompletedWork());
        existingWorkLog.setCurrentWork(workLog.getCurrentWork());
        existingWorkLog.setChallenges(workLog.getChallenges());
        existingWorkLog.setHoursWorked(workLog.getHoursWorked());
        existingWorkLog.setNextDayPlan(workLog.getNextDayPlan());

        return workLogRepository.save(existingWorkLog);
    }

    public void deleteWorkLog(String id) {
        if (!authUserService.isAdmin()) {
            throw new ForbiddenException("Only administrators can delete work logs");
        }
        workLogRepository.deleteById(id);
    }

    public List<WorkLog> getWorkLogsByInternId(String internId) {
        if (authUserService.isAdmin()) {
            return workLogRepository.findByInternId(internId);
        }
        String userId = authUserService.getCurrentUserId();
        if (userId == null) {
            throw new com.nimesh.internship_management.exception.UnauthorizedException("User not authenticated");
        }
        if (!userId.equals(internId)) {
            throw new ForbiddenException("You can only view your own work logs");
        }
        return workLogRepository.findByInternId(internId);
    }
}
