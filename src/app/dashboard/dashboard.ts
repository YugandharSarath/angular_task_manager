import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { TaskService } from '../services/task.service';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../auth/auth.service';
import { Task, TaskPriority, TaskFilter } from '../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideOut', [
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(100px)' }))
      ])
    ])
  ]
})
export class DashboardComponent {
  // Inject services
  private taskService = inject(TaskService);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form signals
  newTaskTitle = signal('');
  newTaskPriority = signal<TaskPriority>('medium');
  newTaskTags = signal('');
  newTaskDueDate = signal<string>('');
  searchQuery = signal('');

  // Filter signals
  selectedPriority = signal<TaskPriority | ''>('');
  selectedStatus = signal<'all' | 'pending' | 'completed'>('all');
  showOverdueOnly = signal(false);

  // UI state
  showFilters = signal(false);
  showAddTaskForm = signal(false);

  // Get reactive data from services
  tasks = this.taskService.tasks;
  allTasks = this.taskService.allTasks;
  completionPercentage = this.taskService.completionPercentage;
  overdueTasks = this.taskService.overdueTasks;
  highPriorityCount = this.taskService.highPriorityCount;
  mediumPriorityCount = this.taskService.mediumPriorityCount;
  lowPriorityCount = this.taskService.lowPriorityCount;
  allTags = this.taskService.allTags;
  currentUser = this.authService.currentUser;
  isDark = this.themeService.isDark;

  // Analytics
  tasksCompletedToday = computed(() => this.taskService.getTasksCompletedToday());
  tasksCompletedWeek = computed(() => this.taskService.getTasksCompletedThisWeek());

  constructor() {
    // Apply initial filters
    this.applyFilters();
  }

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const tags = this.newTaskTags()
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const dueDate = this.newTaskDueDate() ? new Date(this.newTaskDueDate()) : undefined;

    this.taskService.addTask(title, this.newTaskPriority(), {
      tags,
      dueDate,
    });

    // Reset form
    this.newTaskTitle.set('');
    this.newTaskPriority.set('medium');
    this.newTaskTags.set('');
    this.newTaskDueDate.set('');
    this.showAddTaskForm.set(false);
  }

  toggleTask(id: number, event: Event) {
    event.stopPropagation();
    this.taskService.toggleTask(id);
  }

  deleteTask(id: number, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id);
    }
  }

  viewTask(id: number) {
    this.router.navigate(['/tasks', id]);
  }

  logout() {
    this.authService.logout();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // Drag & Drop
  drop(event: CdkDragDrop<Task[]>) {
    const tasks = [...this.tasks()];
    moveItemInArray(tasks, event.previousIndex, event.currentIndex);
    this.taskService.reorderTasks(tasks);
  }

  // Filters
  applyFilters() {
    const filter: TaskFilter = {
      searchQuery: this.searchQuery() || undefined,
      priority: this.selectedPriority() || undefined,
      status: this.selectedStatus() === 'all' ? undefined : this.selectedStatus() as any,
      showOverdue: this.showOverdueOnly() || undefined,
    };
    this.taskService.setFilter(filter);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedPriority.set('');
    this.selectedStatus.set('all');
    this.showOverdueOnly.set(false);
    this.taskService.clearFilters();
  }

  // Helpers
  getPriorityColor(priority: TaskPriority): string {
    const base = this.isDark() ? 'dark:border-l-4' : 'border-l-4';
    switch (priority) {
      case 'high':
        return `${base} border-red-500 ${this.isDark() ? 'bg-red-950/30' : 'bg-red-100'}`;
      case 'medium':
        return `${base} border-yellow-500 ${this.isDark() ? 'bg-yellow-950/30' : 'bg-yellow-100'}`;
      case 'low':
        return `${base} border-green-500 ${this.isDark() ? 'bg-green-950/30' : 'bg-green-100'}`;
      default:
        return 'bg-white dark:bg-gray-800';
    }
  }

  getPriorityBadge(priority: TaskPriority): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  }

  getDueDateColor(task: Task): string {
    if (!task.dueDate) return '';
    if (task.completed) return 'text-gray-500';

    const now = new Date();
    const due = new Date(task.dueDate);
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return 'text-red-600 font-bold';
    if (daysUntilDue <= 1) return 'text-orange-600 font-semibold';
    if (daysUntilDue <= 3) return 'text-yellow-600';
    return 'text-gray-600';
  }

  getCompletedCount(): number {
    return this.tasks().filter(t => t.completed).length;
  }

  getPendingCount(): number {
    return this.tasks().filter(t => !t.completed).length;
  }

  getSubtaskProgress(task: Task): number {
    if (task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(st => st.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  }

  getSubtaskCompletedCount(task: Task): number {
    return task.subtasks ? task.subtasks.filter(st => st.completed).length : 0;
  }
}
