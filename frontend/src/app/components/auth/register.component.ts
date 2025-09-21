import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <div class="min-h-screen bg-white flex items-center justify-center p-4">
      <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        <!-- Left Side - Branding -->
        <div class="hidden lg:block space-y-8">
          <div class="space-y-6">
            <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-2xl font-bold text-white">🚀</span>
            </div>
            <div>
              <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Start Your Journey
              </h1>
              <p class="text-lg text-gray-700 leading-relaxed">
                Join thousands of professionals using our advanced support platform
              </p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 pt-6">
            <div class="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl">
              <div class="text-2xl font-bold text-green-600">50k+</div>
              <div class="text-green-500 text-sm font-medium">Active Users</div>
            </div>
            <div class="text-center bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl">
              <div class="text-2xl font-bold text-blue-600">99.9%</div>
              <div class="text-blue-500 text-sm font-medium">Satisfaction</div>
            </div>
          </div>
          
          <div class="space-y-3 pt-6">
            <div class="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-gray-700 text-sm font-medium">Instant account activation</span>
            </div>
            <div class="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span class="text-gray-700 text-sm font-medium">Role-based access control</span>
            </div>
            <div class="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
              <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span class="text-gray-700 text-sm font-medium">24/7 customer support</span>
            </div>
            <div class="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg">
              <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span class="text-gray-700 text-sm font-medium">Advanced security features</span>
            </div>
          </div>
        </div>

        <!-- Right Side - Registration Form -->
        <div class="w-full max-w-sm mx-auto">
          <div class="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-xl">
            <!-- Header -->
            <div class="text-center mb-4">
              <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span class="text-white text-sm font-bold">✨</span>
              </div>
              <h2 class="text-xl font-bold text-gray-800 mb-1">Join HelpDesk Pro</h2>
              <p class="text-gray-600 text-sm">Create your account and get started</p>
            </div>

            <!-- Registration Form -->
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-3">
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    formControlName="name" 
                    placeholder="Enter your full name"
                    class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm">
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    formControlName="email" 
                    placeholder="Enter your email address"
                    class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm">
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    formControlName="password" 
                    placeholder="Create a strong password (min 6 characters)"
                    class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm">
                </div>
                
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">Select Your Role</label>
                  <select 
                    formControlName="role" 
                    class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all text-sm">
                    <option value="customer">Customer - Submit and track support tickets</option>
                    <option value="agent">Support Agent - Handle customer inquiries</option>
                    <option value="admin">Administrator - Manage system and users</option>
                  </select>
                </div>
              </div>

              <div class="flex items-start gap-3 text-xs">
                <input type="checkbox" class="mt-1 w-4 h-4 rounded border-2 border-gray-300 text-green-500 focus:ring-green-200" required>
                <span class="text-gray-600">
                  I agree to the 
                  <a href="#" class="text-green-600 hover:text-green-700 font-semibold transition-colors">Terms of Service</a> 
                  and 
                  <a href="#" class="text-green-600 hover:text-green-700 font-semibold transition-colors">Privacy Policy</a>
                </span>
              </div>
              
              <button 
                type="submit" 
                [disabled]="registerForm.invalid"
                class="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-4 rounded-lg font-bold hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg text-sm">
                Create Account
              </button>
            </form>

            <div class="mt-4 text-center">
              <span class="text-gray-600 text-xs">Already have an account? </span>
              <a routerLink="/login" class="text-green-600 font-bold hover:text-green-700 transition-colors text-xs">
                Sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['customer', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          alert('Registration successful! Logging you in...');
          // Auto-login after registration
          const { email, password } = this.registerForm.value;
          this.authService.login(email, password).subscribe({
            next: (loginResponse) => {
              // Redirect based on user role
              const userRole = loginResponse.user.role;
              this.redirectToRoleDashboard(userRole);
            },
            error: (loginError) => {
              console.error('Auto-login failed:', loginError);
              alert('Registration successful! Please login manually.');
              this.router.navigate(['/login']);
            }
          });
        },
        error: (error) => {
          console.error('Registration failed:', error);
          alert('Registration failed. Please try again.');
        }
      });
    }
  }

  private redirectToRoleDashboard(role: string): void {
    switch (role) {
      case 'customer':
        this.router.navigate(['/customer']);
        break;
      case 'agent':
        this.router.navigate(['/agent']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}