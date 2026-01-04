export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed';

export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    priority: TaskPriority;
    tags: string[];
    dueDate?: Date;
    subtasks: Subtask[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TaskFilter {
    status?: TaskStatus;
    priority?: TaskPriority;
    tags?: string[];
    searchQuery?: string;
    showOverdue?: boolean;
}
