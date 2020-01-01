import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate{
  url:any = '';
  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.url = state.url;
    console.log("url", this.url);
    if(this.url == '/login'){
      if(this.authService.isAuthenticated()){
        this.router.navigate(['/dashboard']);        
      }
      return true;
    } else{
      if (this.authService.isAuthenticated()) {
        return true;
      }
          // navigate to login page
      this.router.navigate(['/login']);
      
      return false;
    }
  }
}
