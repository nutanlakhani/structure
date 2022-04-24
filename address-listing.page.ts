import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ApplicationUser, LoginService } from "src/app/modules/login/login.service";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { AddressFilter, AddressService } from "../address.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import Swal from "sweetalert2";

@Component({
    selector: 'address-listing',
    templateUrl: 'address-listing.page.html',
    styleUrls: ['address-listing.page.scss']
})
export class AddressListingPage implements OnInit {
    public division_id: number;
    public company_id: number;
    private offset: number = 0;
    private page: number = 1;
    private sort_type: string = 'ASC';
    private fieldNameUsed: string;

    public currentUser: ApplicationUser;
    public addressFilter: AddressFilter;
    public limit: number = 10;
    public numPages: number = 0;
    public currentPage: number = 1;
    public totalItem: number = 0;
    public isDataLoading: Boolean = false;
    public sort_field: string = 'address_type_name';
    public order_type: string = 'DESC';
    public addressList = [];
    public isFilter: Boolean = false;
    public addressDetail;
    @ViewChild('tabset') tabset: TabsetComponent;
    @ViewChild('addressModal') public addressModal: ModalDirective;


    constructor(private loginService: LoginService,
        private router: Router,
        private route: ActivatedRoute,
        private addressService: AddressService,
        private toastrService: ToastrService) {
    }
    ngOnInit() {
        this.currentUser = this.loginService.currentUserValue;
        this.route.params.subscribe(params => {
            this.division_id = params.division_id;
            this.company_id = params.company_id;
            this.limit = this.currentUser.page_size;
            this.addressFilter = this.addressService.addressFilter;
            if (this.addressFilter) {
                this.sort_field = this.addressFilter.sort_field;
                this.sort_type = this.addressFilter.sort_type;
                this.page = this.addressFilter.page;
                this.currentPage = this.addressFilter.page;
                if (this.sort_type != 'name' && this.sort_type != 'ASC') {
                    this.order_type = (this.sort_type == 'ASC') ? 'DESC' : 'ASC';
                    this.isFilter = true;
                }
            }
            this.getAddresses(this.offset, this.limit);
        });
    }

    getAddresses(offset: number, limit: number, resetPagination: Boolean = false): void {
        this.isDataLoading = true;
        let sort;
        if (this.sort_type)
            sort = { 'column_name': this.sort_field, 'type': this.sort_type };
        else
            sort = {};
        let filter = Object.assign({});
        filter.object_id = this.division_id;
        filter.object_type = 'division';

        let addressFilter = Object.assign({});
        addressFilter.sort_field = this.sort_field;
        addressFilter.sort_type = this.sort_type;
        addressFilter.page = this.page;
        localStorage.setItem("addressFilter", JSON.stringify(addressFilter));
        this.addressService.addressListing(offset, limit, sort, filter).subscribe(res => {
            this.isDataLoading = false;
            this.addressList = res.data;
            if (this.offset === 0)
                this.totalItem = res.count;

            if (resetPagination)
                this.currentPage = 1;
        }
            , err => {
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


    /* This function is call when page change*/
    pageChanged(event: any, resetPagination: Boolean = false): void {
        this.page = event.page;
        this.offset = ((this.page - 1) * this.limit);
        this.getAddresses(this.offset, this.limit, resetPagination);
    }

    /* This function is use for reset filter */
    resetFilter(): void {
        this.sort_type = 'ASC';
        this.sort_field = 'name';
        this.order_type = 'DESC';
        if (this.isFilter) {
            this.isFilter = false;
            const event = { page: 1 };
            this.pageChanged(event, true);
        }
    }

    headerSort(field_name, order_type) {
        if (field_name != 'name' || order_type != 'ASC') {
            this.isFilter = true;
        } else {
            this.isFilter = false;
        }
        this.sort_field = field_name;
        if (!this.fieldNameUsed) {
            this.fieldNameUsed = this.sort_field;
            this.sort_type = order_type;
            if (order_type === 'ASC') {
                this.order_type = 'DESC';
            } else {
                this.order_type = 'ASC';
            }
        } else if (this.fieldNameUsed === field_name) {
            this.sort_type = order_type;
            if (order_type === 'ASC') {
                this.order_type = 'DESC';
            } else {
                this.order_type = 'ASC';
            }
        } else {
            this.fieldNameUsed = field_name;
            this.order_type = 'DESC';
            this.sort_type = 'ASC';
        }
        this.getAddresses(this.offset, this.limit);
    }

    openModal(address_id: number) {
        this.addressService.getAddress(address_id).subscribe(res => {
            this.addressDetail = res; 
            this.addressModal.show();
        });      
    }

    deleteAddress(address_id) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this Address',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'btn btn-primary mr-2',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                this.toastrService.clear();
                this.addressService.deleteAddress(address_id).subscribe(response => {
                    this.toastrService.success('', response.message);
                    location.reload();
                }, error => {
                    this.toastrService.error('', error.error.message);
                });
            }
        });
    }
}