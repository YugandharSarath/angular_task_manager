import { Injectable, signal, computed } from '@angular/core';
import { Task, TaskPriority, Subtask, TaskFilter, TaskStatus } from '../models/task.model';

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    private readonly STORAGE_KEY = 'task_manager_tasks';

    // Reactive state
    private tasksSignal = signal<Task[]>(this.loadTasksFromStorage());
    private filterSignal = signal<TaskFilter>({});

    // Public computed signals
    tasks = computed(() => this.applyFilters(this.tasksSignal(), this.filterSignal()));
    allTasks = computed(() => this.tasksSignal());
    completedTasks = computed(() => this.tasks().filter(t => t.completed));
    pendingTasks = computed(() => this.tasks().filter(t => !t.completed));
    overdueTasks = computed(() => {
        const now = new Date();
        return this.tasks().filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
    });

    completionPercentage = computed(() => {
        const total = this.tasks().length;
        if (total === 0) return 0;
        const completed = this.completedTasks().length;
        return Math.round((completed / total) * 100);
    });

    // Priority counts
    highPriorityCount = computed(() => this.tasks().filter(t => t.priority === 'high' && !t.completed).length);
    mediumPriorityCount = computed(() => this.tasks().filter(t => t.priority === 'medium' && !t.completed).length);
    lowPriorityCount = computed(() => this.tasks().filter(t => t.priority === 'low' && !t.completed).length);

    // Tag list
    allTags = computed(() => {
        const tagSet = new Set<string>();
        this.allTasks().forEach(task => {
            task.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    });

    constructor() {
        // Auto-save to localStorage whenever tasks change
        this.tasks();
    }

    private loadTasksFromStorage(): Task[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return parsed.map((t: any) => ({
                    ...t,
                    createdAt: new Date(t.createdAt),
                    updatedAt: new Date(t.updatedAt),
                    dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                    tags: t.tags || [],
                    subtasks: t.subtasks || [],
                    order: t.order ?? 0,
                    description: t.description || '',
                }));
            } catch {
                return this.getDefaultTasks();
            }
        }
        return this.getDefaultTasks();
    }

    private getDefaultTasks(): Task[] {
        return [
            {
                id: 1,
                title: 'Learn Angular Signals',
                description: 'Master the new reactive primitives in Angular',
                completed: false,
                priority: 'high',
                tags: ['learning', 'angular'],
                subtasks: [
                    { id: 1, title: 'Read documentation', completed: true },
                    { id: 2, title: 'Build example app', completed: false },
                ],
                order: 0,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                title: 'Build Task Manager',
                description: 'Create a production-ready task management app',
                completed: true,
                priority: 'medium',
                tags: ['project', 'angular'],
                subtasks: [],
                order: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
    }

    private saveToStorage() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasksSignal()));
    }

    private applyFilters(tasks: Task[], filter: TaskFilter): Task[] {
        let filtered = [...tasks];

        // Status filter
        if (filter.status === 'completed') {
            filtered = filtered.filter(t => t.completed);
        } else if (filter.status === 'pending') {
            filtered = filtered.filter(t => !t.completed);
        }

        // Priority filter
        if (filter.priority) {
            filtered = filtered.filter(t => t.priority === filter.priority);
        }

        // Tags filter
        if (filter.tags && filter.tags.length > 0) {
            filtered = filtered.filter(t =>
                filter.tags!.some(tag => t.tags.includes(tag))
            );
        }

        // Search query
        if (filter.searchQuery && filter.searchQuery.trim()) {
            const query = filter.searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query) ||
                t.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Overdue filter
        if (filter.showOverdue) {
            const now = new Date();
            filtered = filtered.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now);
        }

        // Sort by order
        return filtered.sort((a, b) => a.order - b.order);
    }

    // Filter methods
    setFilter(filter: TaskFilter) {
        this.filterSignal.set(filter);
    }

    updateFilter(partialFilter: Partial<TaskFilter>) {
        this.filterSignal.update(current => ({ ...current, ...partialFilter }));
    }

    clearFilters() {
        this.filterSignal.set({});
    }

    getTaskById(id: number): Task | undefined {
        return this.allTasks().find(t => t.id === id);
    }

    addTask(
        title: string,
        priority: TaskPriority = 'medium',
        options?: {
            description?: string;
            tags?: string[];
            dueDate?: Date;
            subtasks?: Subtask[];
        }
    ) {
        const maxOrder = Math.max(...this.allTasks().map(t => t.order), -1);
        const newTask: Task = {
            id: Date.now(),
            title,
            description: options?.description || '',
            completed: false,
            priority,
            tags: options?.tags || [],
            dueDate: options?.dueDate,
            subtasks: options?.subtasks || [],
            order: maxOrder + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.tasksSignal.update(tasks => [...tasks, newTask]);
        this.saveToStorage();
        return newTask;
    }

    updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
        this.tasksSignal.update(tasks =>
            tasks.map(t =>
                t.id === id
                    ? { ...t, ...updates, updatedAt: new Date() }
                    : t
            )
        );
        this.saveToStorage();
    }

    toggleTask(id: number) {
        this.tasksSignal.update(tasks =>
            tasks.map(t =>
                t.id === id
                    ? { ...t, completed: !t.completed, updatedAt: new Date() }
                    : t
            )
        );
        this.saveToStorage();
    }

    deleteTask(id: number) {
        this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
        this.saveToStorage();
    }

    // Reorder tasks (for drag & drop)
    reorderTasks(tasks: Task[]) {
        const reordered = tasks.map((task, index) => ({
            ...task,
            order: index,
            updatedAt: new Date(),
        }));
        this.tasksSignal.set(reordered);
        this.saveToStorage();
    }

    // Subtask methods
    addSubtask(taskId: number, subtaskTitle: string) {
        this.tasksSignal.update(tasks =>
            tasks.map(t => {
                if (t.id === taskId) {
                    const newSubtask: Subtask = {
                        id: Date.now(),
                        title: subtaskTitle,
                        completed: false,
                    };
                    return {
                        ...t,
                        subtasks: [...t.subtasks, newSubtask],
                        updatedAt: new Date(),
                    };
                }
                return t;
            })
        );
        this.saveToStorage();
    }

    toggleSubtask(taskId: number, subtaskId: number) {
        this.tasksSignal.update(tasks =>
            tasks.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        subtasks: t.subtasks.map(st =>
                            st.id === subtaskId ? { ...st, completed: !st.completed } : st
                        ),
                        updatedAt: new Date(),
                    };
                }
                return t;
            })
        );
        this.saveToStorage();
    }

    deleteSubtask(taskId: number, subtaskId: number) {
        this.tasksSignal.update(tasks =>
            tasks.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        subtasks: t.subtasks.filter(st => st.id !== subtaskId),
                        updatedAt: new Date(),
                    };
                }
                return t;
            })
        );
        this.saveToStorage();
    }

    // Tag methods
    addTagToTask(taskId: number, tag: string) {
        this.tasksSignal.update(tasks =>
            tasks.map(t => {
                if (t.id === taskId && !t.tags.includes(tag)) {
                    return {
                        ...t,
                        tags: [...t.tags, tag],
                        updatedAt: new Date(),
                    };
                }
                return t;
            })
        );
        this.saveToStorage();
    }

    removeTagFromTask(taskId: number, tag: string) {
        this.tasksSignal.update(tasks =>
            tasks.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        tags: t.tags.filter(t => t !== tag),
                        updatedAt: new Date(),
                    };
                }
                return t;
            })
        );
        this.saveToStorage();
    }

    // Analytics
    getTasksCompletedToday(): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.allTasks().filter(t => {
            const updated = new Date(t.updatedAt);
            updated.setHours(0, 0, 0, 0);
            return t.completed && updated.getTime() === today.getTime();
        }).length;
    }

    getTasksCompletedThisWeek(): number {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return this.allTasks().filter(t =>
            t.completed && new Date(t.updatedAt) >= weekAgo
        ).length;
    }

    getTasksCompletedThisMonth(): number {
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return this.allTasks().filter(t =>
            t.completed && new Date(t.updatedAt) >= monthAgo
        ).length;
    }
}
