import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Task, TaskPriority } from '../models/task.model';

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './task-detail.html',
    styleUrls: ['./task-detail.css'],
})
export class TaskDetailComponent implements OnInit {
    task = signal<Task | undefined>(undefined);
    isEditing = signal(false);
    editTitle = signal('');
    editPriority = signal<TaskPriority>('medium');

    taskNotFound = computed(() => !this.task());

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private taskService: TaskService
    ) { }

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        const foundTask = this.taskService.getTaskById(id);

        if (foundTask) {
            this.task.set(foundTask);
            this.editTitle.set(foundTask.title);
            this.editPriority.set(foundTask.priority);
        }
    }

    startEdit() {
        this.isEditing.set(true);
    }

    cancelEdit() {
        const currentTask = this.task();
        if (currentTask) {
            this.editTitle.set(currentTask.title);
            this.editPriority.set(currentTask.priority);
        }
        this.isEditing.set(false);
    }

    saveEdit() {
        const currentTask = this.task();
        if (currentTask && this.editTitle().trim()) {
            this.taskService.updateTask(currentTask.id, {
                title: this.editTitle(),
                priority: this.editPriority(),
            });

            // Refresh task data
            const updatedTask = this.taskService.getTaskById(currentTask.id);
            this.task.set(updatedTask);
            this.isEditing.set(false);
        }
    }

    toggleComplete() {
        const currentTask = this.task();
        if (currentTask) {
            this.taskService.toggleTask(currentTask.id);
            const updatedTask = this.taskService.getTaskById(currentTask.id);
            this.task.set(updatedTask);
        }
    }

    deleteTask() {
        const currentTask = this.task();
        if (currentTask && confirm('Are you sure you want to delete this task?')) {
            this.taskService.deleteTask(currentTask.id);
            this.router.navigate(['/dashboard']);
        }
    }

    getPriorityColor(priority: TaskPriority): string {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    }

    getPriorityBadgeColor(priority: TaskPriority): string {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    }
}
