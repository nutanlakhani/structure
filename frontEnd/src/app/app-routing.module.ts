import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginComponent } from './login/login.component';
import { AuthGuardService } from './guards/auth-guard.service';
import { LayoutComponent } from './layout/layout.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate:[AuthGuardService] },
  {
    path:'',
    component:LayoutComponent,
    canActivate:[AuthGuardService],
    children:[
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path:'dashboard',
        loadChildren :() => import('../app/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path:'cities',
        loadChildren :() => import('../app/city/city.module').then(m => m.CityModule)
      },
    ]
  },
    
 
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
