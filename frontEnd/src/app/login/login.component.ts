import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {      
    }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  onSubmit() {
    this.submitted = true; 

    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }
    this.loading = true;
    this.loginForm.value.role = 'Admin';
    this.authService.setUserInfo(JSON.stringify(this.loginForm.value))
    this.loading = false;
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 300)
    
    // this.authService.login(this.loginForm.value).subscribe(
    //   data => {
    //       this.router.navigate([this.returnUrl]);
    //   },
    //   error => {
          
    //       this.loading = false;
    //   });
    }

}
