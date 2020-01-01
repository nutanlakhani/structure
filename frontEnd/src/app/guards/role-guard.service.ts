import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate{

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    console.log("next", next);
    const user = JSON.parse(localStorage.getItem('userInfo'));
    console.log(user.role === next.data.role, user);
    if (user.role === next.data.role) {
      console.log("inside if")
      return true;
    }

    // navigate to not found page
    this.router.navigate(['/404']);
    return false;
  }
}
