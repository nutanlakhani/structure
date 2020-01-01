import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { Routes, RouterModule } from '@angular/router';
import { RoleGuardService } from '../guards/role-guard.service';


const routes: Routes = [
  {
    path: '',    
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent},
      { path: 'admin', 
        component: AdminComponent, 
        canActivate: [RoleGuardService],
        data: {role: 'Admin'}
      }
    ]
  }
]


@NgModule({
  declarations: [ HomeComponent, AdminComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
