import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <!-- Global Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Application Views -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Global Footer -->
      <footer class="bg-white border-t border-slate-200 mt-16 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between text-xs text-slate-500">
          <p>© 2026 Web-based Product Rating and Review System (W-PRRS). All rights reserved.</p>
          <div class="mt-4 sm:mt-0 flex justify-center space-x-6 text-slate-400">
            <span>Spring Boot 3 + MySQL 8.0</span>
            <span>•</span>
            <span>Angular 18 Standalone + Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  title = 'W-PRRS';
}
