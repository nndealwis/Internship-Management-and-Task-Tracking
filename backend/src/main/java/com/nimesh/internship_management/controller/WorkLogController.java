package com.nimesh.internship_management.controller;

import com.nimesh.internship_management.model.WorkLog;
import com.nimesh.internship_management.service.WorkLogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worklogs")
public class WorkLogController {

    private final WorkLogService workLogService;

    public WorkLogController(WorkLogService workLogService) {
        this.workLogService = workLogService;
    }

    @GetMapping
    public List<WorkLog> getAllWorkLogs() {
        return workLogService.getAllWorkLogs();
    }

    @GetMapping("/{id}")
    public WorkLog getWorkLogById(@PathVariable String id) {
        return workLogService.getWorkLogById(id);
    }

    @PostMapping
    public WorkLog createWorkLog(@Valid @RequestBody WorkLog workLog) {
        return workLogService.createWorkLog(workLog);
    }

    @PutMapping("/{id}")
    public WorkLog updateWorkLog(@PathVariable String id,
                                 @Valid @RequestBody WorkLog workLog) {
        return workLogService.updateWorkLog(id, workLog);
    }

    @DeleteMapping("/{id}")
    public void deleteWorkLog(@PathVariable String id) {
        workLogService.deleteWorkLog(id);
    }

    @GetMapping("/intern/{internId}")
    public List<WorkLog> getWorkLogsByInternId(@PathVariable String internId) {
        return workLogService.getWorkLogsByInternId(internId);
    }
}
