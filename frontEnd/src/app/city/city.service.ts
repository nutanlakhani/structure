import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CityService {
  baseUrl = environment.baseUrl;
  constructor(private http:HttpClient) { }

  addCity(data){
    return this.http.post(this.baseUrl+'cities/add', data);
  }

  getCities(params){
    return this.http.post<DataTablesResponse>(this.baseUrl+'cities/list', params);
  }
}
