import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRole = route.data['role'];
    
    if (currentUser.role === requiredRole) {
      return true;
    }

    // Redirect to appropriate dashboard based on user's actual role
    this.redirectToRoleDashboard(currentUser.role);
    return false;
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