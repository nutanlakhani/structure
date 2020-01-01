import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CityService } from './city.service';


@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.css']
})
export class CityComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  cities: any = [];
  constructor(private fb: FormBuilder,
    private cityService: CityService) { }

  ngOnInit() {
    const that = this;
    console.log("cities call");
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 2,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.cityService.getCities(
          dataTablesParameters
        ).subscribe(resp => {
          that.cities = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: []
          });
        });
      },
      columns: [{ data: 'name' }, { data: 'status' }, {data:'createAt'}]
    };
  }

}
