import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CityComponent } from './city.component';
import { Routes, RouterModule } from '@angular/router';
import { AddCityComponent } from './add-city/add-city.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';


const routes: Routes = [{
    path:'',
    component: CityComponent
  },{
    path:'add',
    component: AddCityComponent
  }
]

@NgModule({
  declarations: [CityComponent, AddCityComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    DataTablesModule
  ]
})
export class CityModule { }
