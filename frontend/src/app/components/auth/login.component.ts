import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-white flex items-center justify-center p-4">
      <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        <!-- Left Branding Side -->
        <div class="hidden lg:block space-y-8">
          <div class="space-y-6">
            <div class="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-2xl font-bold text-white">🎧</span>
            </div>
            <div>
              <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                HelpDesk Pro
              </h1>
              <p class="text-lg text-gray-700 leading-relaxed">
                Advanced customer support platform designed for modern businesses
              </p>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 pt-6">
            <div class="text-center bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl">
              <div class="text-2xl font-bold text-blue-600">24/7</div>
              <div class="text-blue-500 text-sm font-medium">Support</div>
            </div>
            <div class="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl">
              <div class="text-2xl font-bold text-green-600">99.9%</div>
              <div class="text-green-500 text-sm font-medium">Uptime</div>
            </div>
            <div class="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl">
              <div class="text-2xl font-bold text-purple-600">10k+</div>
              <div class="text-purple-500 text-sm font-medium">Users</div>
            </div>
          </div>
          
          <div class="space-y-3 pt-6">
            <div class="flex items-center space-x-3 bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-lg">
              <div class="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <span class="text-gray-700 text-sm font-medium">Real-time ticket management</span>
            </div>
            <div class="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-gray-700 text-sm font-medium">Advanced analytics & reporting</span>
            </div>
            <div class="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span class="text-gray-700 text-sm font-medium">Multi-channel communication</span>
            </div>
          </div>
        </div>

        <!-- Right Login Form Side -->
        <div class="w-full max-w-sm mx-auto">
          <div class="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-xl">
            
            <div class="text-center mb-6">
              <div class="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span class="text-white text-lg font-bold">🔐</span>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p class="text-gray-600">Sign in to access your dashboard</p>
            </div>
            
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email"
                  formControlName="email"
                  class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input 
                  type="password"
                  formControlName="password"
                  class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-pink-200 focus:border-pink-500 transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <div class="flex items-center justify-between text-xs">
                <label class="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" class="w-4 h-4 rounded border-2 border-gray-300 text-pink-500 focus:ring-pink-200"/>
                  <span class="font-medium">Remember me</span>
                </label>
                <a href="#" class="text-pink-600 hover:text-pink-700 font-semibold transition-colors">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                [disabled]="loginForm.invalid"
                class="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
              >
                Sign In
              </button>
            </form>

            <div class="mt-6 text-center">
              <span class="text-gray-600 text-sm">Don't have an account? </span>
              <a routerLink="/register" class="text-pink-600 font-bold hover:text-pink-700 transition-colors text-sm">Sign up</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          const user = response.user;
          if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (user.role === 'agent') {
            this.router.navigate(['/agent']);
          } else {
            this.router.navigate(['/customer']);
          }
        },
        error: (error) => console.error('Login failed:', error),
      });
    }
  }
}
