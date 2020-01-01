import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.baseUrl
  constructor(private http: HttpClient, private route:Router) { }
  isAuthenticated(){
    if(localStorage.getItem('userInfo')){
      return true;
    } else {
      return false;
    }
  }
  getUserInfo(){
    return localStorage.getItem('userInfo');
  }

  setUserInfo(data){
    localStorage.setItem('userInfo', data);
  }

  login(data){
    return this.http.post(this.baseUrl+'auth/login', data);
  }
  logout(){
    localStorage.removeItem('userInfo');
    this.route.navigate(['/login']);
  }
}
