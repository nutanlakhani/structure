import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ServiceProviderTypeService {

	constructor(private readonly http: HttpClient) { }
	getGuaranteeTypeData(company_id: number) {
		return this.http.get<any>('/api/service_provider_type/getServiceProviderTypeData/' + company_id);
	}
}