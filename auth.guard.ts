import { Injectable } from '@angular/core';

import {
	ActivatedRouteSnapshot,
	RouterStateSnapshot,
	CanActivate,
	Router
} from '@angular/router';
import { LoginService } from '../modules/login/login.service';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private router: Router, private authService: LoginService) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const currentUser = this.authService.currentUserValue;
		if (currentUser) {
			// logged in so return true
			if (route.data.roles && route.data.roles.indexOf(currentUser.user_type) === -1) {
				
                // role not authorised so redirect to home page
                this.router.navigate(['/']);
                return false;
            }
			return true;
		}

		// not logged in so redirect to login page with the return url
		this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
		return false;
	}
}
