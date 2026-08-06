package com.nimesh.internship_management.service;

import com.nimesh.internship_management.model.WorkLog;
import com.nimesh.internship_management.repository.WorkLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkLogService {

    private final WorkLogRepository workLogRepository;

    public WorkLogService(WorkLogRepository workLogRepository) {
        this.workLogRepository = workLogRepository;
    }

    public List<WorkLog> getAllWorkLogs() {
        return workLogRepository.findAll();
    }

    public WorkLog getWorkLogById(String id) {
        return workLogRepository.findById(id).orElse(null);
    }

    public WorkLog createWorkLog(WorkLog workLog) {
        return workLogRepository.save(workLog);
    }

    public WorkLog updateWorkLog(String id, WorkLog workLog) {

        WorkLog existingWorkLog = workLogRepository.findById(id).orElse(null);

        if (existingWorkLog == null) {
            return null;
        }

        existingWorkLog.setInternId(workLog.getInternId());
        existingWorkLog.setDate(workLog.getDate());
        existingWorkLog.setCompletedWork(workLog.getCompletedWork());
        existingWorkLog.setCurrentWork(workLog.getCurrentWork());
        existingWorkLog.setChallenges(workLog.getChallenges());
        existingWorkLog.setHoursWorked(workLog.getHoursWorked());
        existingWorkLog.setNextDayPlan(workLog.getNextDayPlan());

        return workLogRepository.save(existingWorkLog);
    }

    public void deleteWorkLog(String id) {
        workLogRepository.deleteById(id);
    }

    public List<WorkLog> getWorkLogsByInternId(String internId) {
        return workLogRepository.findByInternId(internId);
    }
}