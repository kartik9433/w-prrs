import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Branding -->
          <div class="flex items-center gap-3">
            <a routerLink="/products" class="flex items-center gap-2.5 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <span class="text-xl font-bold bg-gradient-to-r from-slate-900 via-brand-800 to-brand-600 bg-clip-text text-transparent">W-PRRS</span>
                <span class="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400 uppercase tracking-wider">Product Reviews</span>
              </div>
            </a>

            <!-- Nav Links -->
            <nav class="hidden md:flex items-center ml-8 space-x-1">
              <a
                routerLink="/products"
                routerLinkActive="bg-brand-50 text-brand-700 font-semibold"
                [routerLinkActiveOptions]="{exact: true}"
                class="px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors"
              >
                Browse Products
              </a>

              <a
                *ngIf="authService.isModerator()"
                routerLink="/moderation"
                routerLinkActive="bg-amber-50 text-amber-700 font-semibold"
                class="px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Moderation Queue
              </a>

              <a
                *ngIf="authService.currentUserValue"
                [routerLink]="['/users', authService.currentUserValue.userId, 'reviews']"
                routerLinkActive="bg-brand-50 text-brand-700 font-semibold"
                class="px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-brand-600 hover:bg-slate-50 transition-colors"
              >
                My Reviews
              </a>
            </nav>
          </div>

          <!-- Right side: Persona demo switcher & active profile -->
          <div class="flex items-center gap-3">
            <!-- Persona Switcher Pill (Great for Demoing User vs Moderator workflows) -->
            <div class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 border border-slate-200">
              <span class="px-2 text-slate-400 hidden sm:inline">Role:</span>
              <button
                type="button"
                (click)="switchRole('USER')"
                [ngClass]="authService.currentUserValue?.role === 'USER' ? 'bg-white shadow text-brand-700 font-bold' : 'hover:text-slate-900'"
                class="px-2.5 py-1 rounded-lg transition-all"
              >
                Customer
              </button>
              <button
                type="button"
                (click)="switchRole('MODERATOR')"
                [ngClass]="authService.currentUserValue?.role === 'MODERATOR' ? 'bg-amber-500 shadow text-white font-bold' : 'hover:text-slate-900'"
                class="px-2.5 py-1 rounded-lg transition-all"
              >
                Moderator
              </button>
              <button
                type="button"
                (click)="switchRole('ADMIN')"
                [ngClass]="authService.currentUserValue?.role === 'ADMIN' ? 'bg-indigo-600 shadow text-white font-bold' : 'hover:text-slate-900'"
                class="px-2.5 py-1 rounded-lg transition-all"
              >
                Admin
              </button>
            </div>

            <!-- User Info / Avatar -->
            <div *ngIf="authService.currentUser$ | async as user; else loginBtn" class="flex items-center gap-2 pl-2">
              <img
                [src]="user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'"
                alt="Avatar"
                class="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/30"
              />
              <div class="hidden lg:block text-left text-xs leading-tight">
                <p class="font-semibold text-slate-800">{{ user.fullName }}</p>
                <p class="text-slate-400 capitalize">{{ user.role.toLowerCase() }}</p>
              </div>
            </div>

            <ng-template #loginBtn>
              <button
                type="button"
                (click)="switchRole('USER')"
                class="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
              >
                Login Demo
              </button>
            </ng-template>
          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  constructor(public authService: AuthService, private router: Router) {
    // If not logged in, auto-login as customer by default for immediate preview
    if (!this.authService.isAuthenticated()) {
      this.switchRole('USER');
    }
  }

  switchRole(role: Role): void {
    this.authService.switchRoleDemo(role).subscribe({
      next: (user) => {
        if (role === 'MODERATOR') {
          this.router.navigate(['/moderation']);
        }
      },
      error: (err) => {
        console.warn('Could not connect to backend auth, using local mock persona:', err);
        // Fallback demo state if backend server isn't running yet
        const demoUser = {
          userId: role === 'MODERATOR' ? 1 : (role === 'ADMIN' ? 2 : 3),
          email: role === 'MODERATOR' ? 'moderator@example.com' : 'user@example.com',
          fullName: role === 'MODERATOR' ? 'Sarah Connor' : 'John Doe',
          role: role,
          profilePicture: role === 'MODERATOR'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
        };
        localStorage.setItem('wprrs_user', JSON.stringify(demoUser));
        (this.authService as any).currentUserSubject.next(demoUser);
        if (role === 'MODERATOR') {
          this.router.navigate(['/moderation']);
        }
      }
    });
  }
}
