import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CityService } from '../city.service';


@Component({
  selector: 'app-add-city',
  templateUrl: './add-city.component.html',
  styleUrls: ['./add-city.component.css']
})
export class AddCityComponent implements OnInit {

  cityForm: FormGroup
  constructor(private fb: FormBuilder,
    private cityService: CityService) { }

  ngOnInit() {
    this.cityForm = this.fb.group({
      'cityName': ['', Validators.required]
    })
  }

  saveCity(value){
    console.log("value", value);

    if(this.cityForm.valid){
      this.cityService.addCity(value).subscribe(response =>{
        console.log("response", response);
      }, err =>{
        console.log("err", err);
      })
    } else {

    }
  }

}
