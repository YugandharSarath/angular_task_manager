import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'task_manager_auth';

  // Reactive state with signals
  private isAuthenticatedSignal = signal(this.checkInitialAuth());
  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());

  // Public computed signals
  isAuthenticated = computed(() => this.isAuthenticatedSignal());
  currentUser = computed(() => this.currentUserSignal());

  constructor(private router: Router) {
    // Sync auth state to localStorage
    effect(() => {
      const user = this.currentUserSignal();
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });
  }

  private checkInitialAuth(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY);
  }

  private loadUserFromStorage(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  login(email: string, password: string): boolean {
    // Fake auth logic - in real app, call backend API
    if (email === 'admin@test.com' && password === '1234') {
      const user: User = {
        email,
        name: 'Admin User',
      };
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
      return true;
    }
    return false;
  }

  logout() {
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }
}
