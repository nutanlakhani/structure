import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Messages } from "src/app/shared/messages";
import { ApplicationUser, LoginService } from "src/app/modules/login/login.service";
import { DEFAULT_COUNTRY_ID } from "src/app/shared/common.constants";
import { AddressService } from "../address.service";
import { CountryService } from "src/app/modules/country/country.service";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { LookupService } from "../../lookup-values/lookup.service";

@Component({
    selector: 'add-edit-address',
    templateUrl: 'add-edit-address.page.html',
    styleUrls: ['add-edit-address.page.scss']
})
export class AddEditAddressPage implements OnInit {

    public address_id: number;
    public division_id: number;
    public company_id: number;
    public isSubmitted: Boolean = false;
    public btnDisabled = false;
    public addressData;
    public currentUser: ApplicationUser;
    public messages = Messages;
    public addressForm: FormGroup;
    public countryList = [];
    public stateList = [];
    public addressTypeList = [];
    public maxDate: Date;
    @ViewChild('tabset') tabset: TabsetComponent;

    constructor(private loginService: LoginService,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private addressService: AddressService,
        private lookupService: LookupService,
        private countryService: CountryService,
        private toastrService: ToastrService
    ) {
        this.addressForm = this.fb.group({
            'address_type_id': ['', [Validators.required]],
            'address1': [''],
            'address2': [''],
            'city': [''],
            'state_id': ['', [Validators.required]],
            'zipcode': [''],
            'country_id': [DEFAULT_COUNTRY_ID, [Validators.required]],
            'effective_date':[new Date(),[Validators.required]],
            'expiration_date': []
        });
    }
    ngOnInit() {
        this.currentUser = this.loginService.currentUserValue;
        this.getCountryData();
        this.route.params.subscribe(params => {
            this.address_id = params.id;
            this.division_id = params.division_id;
            this.company_id = params.company_id;
            this.getAddressTypeData();
            if (this.address_id) {
                this.getAddress();
            }
        });
    }

    get f() {
        return this.addressForm.controls;
    }

    getCountryData() {
        this.countryService.getCountryData().subscribe(res => {
            this.countryList = res;
            if(!this.address_id) {
                this.getStateData(this.addressForm.controls['country_id'].value);
            }
        });
    }

    changeCountry(): void {
        const country_id = this.addressForm.controls['country_id'].value;
        this.addressForm.controls['state_id'].patchValue('');       
        this.getStateData(country_id);
    }

    getStateData(country_id) {
        this.addressService.getStateData(country_id).subscribe(res => {
            this.stateList = res;
        });
    }

    getAddressTypeData() {
        this.lookupService.getAddressTypeData(this.company_id).subscribe(res => {
            this.addressTypeList = res;
        });
    }

    onValueChange(value: Date): void {
        if(value) {
            this.addressForm.controls['effective_date'].patchValue(value);
            this.maxDate = value;
        } else {
            this.maxDate = null;
        }
    }

    getAddress() {
        this.addressService.getAddress(this.address_id).subscribe(res => {
            this.addressData = res;
            if (this.addressData) {
                if(this.addressData.country_id) {
                    this.getStateData(this.addressData.country_id);
                }
                this.addressForm.patchValue({
                    address_type_id: this.addressData.address_type_id,
                    address1: this.addressData.address1,
                    address2: this.addressData.address2,
                    city: this.addressData.city,
                    state_id: this.addressData.state_id,
                    zipcode: this.addressData.zipcode,
                    country_id: this.addressData.country_id,
                    effective_date: this.addressData.effective_date ? new Date(this.addressData.effective_date) : new Date(),
                    expiration_date: (this.addressData.expiration_date && this.addressData.expiration_date != '0000-00-00')  ? new Date(this.addressData.expiration_date) : null
                });
            }
        }, err => {
            this.toastrService.error(err);
            this.router.navigate(['/settings/division/list']);
        });
    }

    setTab(event) {
        let tabList = this.tabset.tabs;
        for(const [index, t] of tabList.entries()) {
            if (index != 1 && (event.target.outerText == t.heading)) {
                if ((event.target.outerText == "Main")) {
                    this.router.navigate(['/settings/division/' + t.id + '/' + this.division_id]);
                    return false;
                } else {
                    this.router.navigate(['/settings/division/' + this.division_id + '/company/' + this.company_id + '/' + t.id]);
                    return false;
                }
                
            }
        }
    }

    submitForm($ev, formData): void {
        this.isSubmitted = true;        
        formData.effective_date = (formData.effective_date) ? formData.effective_date.toISOString().split('T')[0] : '';
        formData.expiration_date = (formData.expiration_date) ? formData.expiration_date.toISOString().split('T')[0] : '';
        $ev.preventDefault();
        if (this.addressForm.valid) {
            this.btnDisabled = true;
            if (this.address_id) {               
                this.addressService.updateAddress(this.address_id, formData).subscribe(
                    res => {
                        this.btnDisabled = false;
                        this.toastrService.success(res.message);
                        this.router.navigate(['/settings/division/'+this.division_id+'/company/'+this.company_id+'/addressList']);
                    }, err => {
                        this.btnDisabled = false;
                        this.toastrService.error(err);
                    });
            } else {
                formData.company_id = this.company_id;
                formData.object_id = this.division_id;
                this.addressService.addAddress(formData).subscribe(
                    res => {
                        this.btnDisabled = false;
                        this.toastrService.success(res.message);
                        this.router.navigate(['/settings/division/'+this.division_id+'/company/'+this.company_id+'/addressList']);
                    }, err => {
                        formData.effective_date = new Date();
                        this.btnDisabled = false;
                        this.toastrService.error(err);
                    });
            }
        }
    }
}