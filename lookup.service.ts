import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class LookupService {

	constructor(private readonly http: HttpClient) { }

	getAddressTypeData(company_id: number) {
		return this.http.get<any>('/api/addressType/getAddressTypeData/'+ company_id);
	}

	getTimeZoneData() {
		return this.http.get<any>('/api/timezone/getTimeZoneData/');
	}

	getJobTypeData(params) {
		return this.http.post<any>('/api/job_type/getJobTypeData', params);
	}

	getConfirmationStatusData(company_id) {
		return this.http.get<any>('/api/confirmation_status/getConfirmationStatusData/'+ company_id);
	}

	getInvoiceTermData(company_id) {
		return this.http.get<any>('/api/invoice_term/getInvoiceTermData/'+ company_id);
	}

	getInvoicePrintTypeData(company_id) {
		return this.http.get<any>('/api/invoice_print_type/getInvoicePrintTypeData/'+ company_id);
	}

	getInvoiceChargeTypeData(company_id) {
		return this.http.get<any>('/api/invoice_charge_type/getInvoiceChargeTypeData/'+ company_id);
	}
}
