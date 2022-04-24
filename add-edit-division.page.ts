import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Messages } from "src/app/shared/messages";
import { ApplicationUser, LoginService } from "src/app/modules/login/login.service";
import { CompanyService } from "../../company/company.service";
import { DivisionService } from "../division.service";
import { LookupService } from "../../lookup-values/lookup.service";
import { CDN_URL, DIVISION_LOGO_HEIGHT, DIVISION_LOGO_WIDTH } from "src/app/shared/common.constants";
import { TabsetComponent } from "ngx-bootstrap/tabs";

@Component({
    selector: 'add-edit-division',
    templateUrl: 'add-edit-division.page.html',
    styleUrls: ['add-edit-division.page.scss']
})
export class AddEditDivisionPage implements OnInit {

    private integerRex: string = "^(){0,1}\\d+$";

    public company_id;
    public division_id;
    public isEnabled: boolean = false;
    public companyData;
    public divisionData;
    public isSubmitted: boolean = false;
    public btnDisabled: boolean = false;
    public isAddressTabDisabled: boolean = true;
    public isConferenceRoomTabDisabled: boolean = true;
    public isNotificationSettingTabDisabled: boolean = true;
    public currentUser: ApplicationUser;
    public messages = Messages;
    public divisionForm: FormGroup;
    public isDisabled: boolean = true;
    public companiesList = [];
    public divisionTypeList = [];
    public timeZoneList = [];
    public addressTypeList = [];
    public jobTypeList = [];
    public confirmationStatusList = [];
    public invoiceTermList = [];
    public invoicePrintList = [];
    public invoiceChargeList = [];
    public clientLetterTemplateList = [];
    public providerLetterTemplateList = [];
    public subHeading = 'Example: John Doe';
    public interest_days_text = 'Use {DATE} in text to print invoice sent date+ number of days.';
    public logo: any = {
        url: "",
        preview: "",
        extensionErr: false,
        sizeErr: false,
        heightWidthErr: false
    };
    @ViewChild('tabset') tabset: TabsetComponent;

    constructor(private loginService: LoginService,
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private companyService: CompanyService,
        private divisionService: DivisionService,
        private lookupService: LookupService,
        private toastrService: ToastrService
    ) {
        this.divisionForm = this.fb.group({
            'division_type_id': ['', [Validators.required]],
            'name': ['', [Validators.required]],
            'division_code': ['', [Validators.required, Validators.pattern("[0-9a-zA-Z]+")]],
            'phone': ['', [Validators.required]],
            'default_time_zone_id': [0],
            'default_client_address_type_id': [0],
            'default_billing_address_type_id': [0],

            'default_job_type_id': [0],
            'include_files_notices_on_production_worksheet': [false],
            'exclude_weekends_and_holidays_hours': [false],
            'show_jobs_service_providers_x_hours_before_job': ['', [Validators.pattern(this.integerRex), Validators.max(336), Validators.min(0)]],
            'show_jobs_service_providers_after_client_confirms': [false],
            'show_previous_providers_of_case_on_jobs': [false],
            'provider_confirm_job_hours_before_start_time': ['', [Validators.pattern(this.integerRex), Validators.max(336), Validators.min(0)]],
            'confirmation_can_take_positive': ['I can take this job.', [Validators.required, Validators.maxLength(50)]],
            'confirmation_can_take_negative': ['I cannot take this job.', [Validators.required, Validators.maxLength(50)]],
            'hide_public_notes_for_check_in': [false],
            'default_checkout_deliverby_date_to_job_deliverby_date': [false],
            'hide_expense_section_on_worksheet': [false],
            'service_provider_time_off_notice_hours': ['', [Validators.pattern(this.integerRex), Validators.max(336), Validators.min(0)]],
            'default_notice_hours': ['', [Validators.pattern(this.integerRex), Validators.max(336), Validators.min(0)]],
            'hide_service_provider_on_jobs': [false],
            'contact_confirm_job_hours_before_start_time': ['', [Validators.pattern(this.integerRex), Validators.max(336), Validators.min(0)]],
            'hide_insurance_information_on_jobs': [false],
            'opposing_counsel_have_access_to_jobs': [false],
            'file_search': [{ value: false, disabled: true }],
            'rapid_transcript_access': [{ value: false, disabled: true }],

            'allow_scheduling_requests_by_account_holders': [true],
            'allow_scheduling_requests_by_unknown_users': [false],
            'allow_rapid_requests_by_account_holders': [true],
            'allow_rapid_requests_by_unknown_users': [true],
            'require_notice_file_on_rapid_requests': [false],
            'rapid_request_other_information_label': ['', [Validators.required, Validators.maxLength(255)]],

            'deponent_sorted': ['alpha_by_fullname', [Validators.required]],

            'default_invoice_term_id': [0],
            'allow_quick_pay': [false],
            'default_invoice_print_type_id': [0],

            'print_transcript_in_deponent_subheadings': [false],
            'print_job_type_in_deponent_subheadings': [false],
            'print_volumn_number_in_deponent_subheadings': [false],

            'group_by_deponent': [false],

            'invoice_interest_line_item_text': ['', [Validators.maxLength(50)]],
            'interest_days': ['', [Validators.pattern(this.integerRex), Validators.max(999), Validators.min(0)]],
            'print_invoice_text': ['1'],
            'invoice_charge_type_id': [0],
            'default_finance_charge': ['', [Validators.pattern('[\+]?(([0-9]+)([\.,]([0-9]+))?|([\.,]([0-9]+))?)'), Validators.max(100), Validators.min(0)]],

            'statements_based_on_date': ['0'],
            'aging_bucket_based_on_date': ['0'],

            'report_logo': ['']
        });
    }
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.company_id = params.company_id
            this.division_id = params.id;
            if (this.company_id) {
                this.getCompanyData(this.company_id);
            }
            if (this.division_id) {
                this.isAddressTabDisabled = false;
                this.isConferenceRoomTabDisabled = false;
                this.isNotificationSettingTabDisabled = false;
                this.getDivisionData();
            }
        });
        this.currentUser = this.loginService.currentUserValue;
        if (this.currentUser.user_type == 'admin') {
            this.divisionForm.addControl('company_id', new FormControl(['', [Validators.required]]));
        }
        if (this.currentUser.user_type == 'admin' && !this.division_id) {
            this.getCompanyList();
        }
        else {
            this.getAddressTypeData(this.company_id);
            this.getConfirmationStatusData(this.company_id);
            this.getInvoiceTermData(this.company_id);
            this.getInvoicePrintTypeData(this.company_id)
            this.getInvoiceChargeTypeData(this.company_id)
        }
        if (this.currentUser.user_type == 'admin' || this.currentUser.user_type == 'company') {
            this.divisionForm.addControl('default_confirmation_status_id', new FormControl('0'));
        }
        this.getDivisionType();
        this.getTimezone();
    }

    get f() {
        return this.divisionForm.controls;
    }

    getCompanyList() {
        this.companyService.getCompany().subscribe(res => {
            this.companiesList = res;
            let companyIndex = this.companiesList.findIndex(c => c.company_id == this.company_id);
            companyIndex ? this.divisionForm.controls['company_id'].patchValue(this.companiesList[companyIndex].company_id) : this.divisionForm.controls['company_id'].patchValue(this.companiesList[0].company_id);
            const companyId = (this.divisionForm.controls['company_id']) ? this.divisionForm.controls['company_id'].value : this.company_id;
            this.getAddressTypeData(companyId);
            this.getConfirmationStatusData(companyId);
            this.getInvoiceTermData(companyId);
            this.getInvoicePrintTypeData(companyId)
            this.getInvoiceChargeTypeData(companyId)
        });
    }

    changeCompany(): void {
        const company_id = this.divisionForm.controls['company_id'].value;
        this.getAddressTypeData(company_id);
        this.getConfirmationStatusData(company_id);
        this.getInvoiceTermData(company_id);
        this.getInvoicePrintTypeData(company_id)
        this.getInvoiceChargeTypeData(company_id)
        this.getJobTypeData(company_id, this.divisionForm.controls['division_type_id'].value)
    }

    changeDivisionType(): void {
        const companyId = (this.divisionForm.controls['company_id']) ? this.divisionForm.controls['company_id'].value : this.company_id;
        this.getJobTypeData(companyId, this.divisionForm.controls['division_type_id'].value)
    }

    getDivisionType() {
        this.divisionService.getDivisionTypeData().subscribe(res => {
            this.divisionTypeList = res;
            if (!this.division_id && this.divisionTypeList.length > 0) {
                this.divisionForm.controls['division_type_id'].patchValue(this.divisionTypeList[0].division_type_id);
                const companyId = (this.divisionForm.controls['company_id']) ? this.divisionForm.controls['company_id'].value : this.company_id;
                this.getJobTypeData(companyId, this.divisionForm.controls['division_type_id'].value)
            }
        })
    }

    getTimezone() {
        this.lookupService.getTimeZoneData().subscribe(res => {
            this.timeZoneList = res;
        })
    }

    getAddressTypeData(company_id: number) {
        this.lookupService.getAddressTypeData(company_id).subscribe(res => {
            this.addressTypeList = res;
        });
    }

    getJobTypeData(company_id: number, division_type_id: number) {
        this.lookupService.getJobTypeData({ company_id, division_type_id }).subscribe(res => {
            this.jobTypeList = res;
        });
    }

    getConfirmationStatusData(company_id) {
        this.lookupService.getConfirmationStatusData(company_id).subscribe(res => {
            this.confirmationStatusList = res;
        });
    }

    getInvoiceTermData(company_id): void {
        this.lookupService.getInvoiceTermData(company_id).subscribe(res => {
            this.invoiceTermList = res;
        })
    }

    getInvoicePrintTypeData(company_id): void {
        this.lookupService.getInvoicePrintTypeData(company_id).subscribe(res => {
            this.invoicePrintList = res;
        })
    }

    getInvoiceChargeTypeData(company_id): void {
        this.lookupService.getInvoiceChargeTypeData(company_id).subscribe(res => {
            this.invoiceChargeList = res;
        })
    }
    getCompanyData(company_id) {
        this.companyService.getCompanyFields(company_id).subscribe(res => {
            this.companyData = res;
            if (this.currentUser.user_type == 'admin' && this.division_id) {
                this.companiesList = [{ 'company_id': company_id, 'name': this.companyData.name }];
                this.divisionForm.controls['company_id'].patchValue(company_id);
            }
            if (this.companyData && !this.companyData['integrate_solaria']) {
                this.divisionForm.addControl('calculate_of_deliver_by_date_excludes_weekends_holidays', new FormControl(false));
            }
            if (this.companyData && this.companyData['use_product_tax_templates']) {
                this.divisionForm.addControl('print_tax_indicator_or_amount', new FormControl('0'));
                this.divisionForm.addControl('tax_column_name', new FormControl('', Validators.maxLength(20)));
            }
        },
            err => {
                this.router.navigate(['/settings/division/view/', this.division_id]);
            });
    }
    setUserDefaultImage($event) {
        $event.target.src = CDN_URL + 'images/Demo-Logo.jpg';
    }
    removeLogo() {
        this.logo.url = '';
        this.logo.preview = '';
        this.divisionForm.controls['report_logo'].patchValue('');
        if (this.divisionData) {
            this.divisionData.report_logo = '';
        }
    }

    onSelectFile(event) {
        const file = event.target.files[0];
        this.logo.url = '';
        this.logo.sizeErr = false;
        this.logo.extensionErr = false;
        this.logo.heightWidthErr = false;
        if (file) {
            const reader = new FileReader();
            let fileTypeArr = ['jpg', 'png', 'gif', 'jpeg'];
            let name = file.name.substring(file.name.lastIndexOf('.') + 1);
            let size = file.size;
            if (fileTypeArr.indexOf(name) === -1) {
                this.logo.extensionErr = true;
            } else if (size > 1048576) {
                this.logo.sizeErr = true;
            } else {
                reader.readAsDataURL(event.target.files[0]);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = reader.result as string;
                    img.onload = () => {
                        const height = img.naturalHeight;
                        const width = img.naturalWidth;
                        if (width != DIVISION_LOGO_WIDTH || height != DIVISION_LOGO_HEIGHT) {
                            this.logo.heightWidthErr = true;
                        } else {
                            this.logo.url = file;
                        }
                    };
                    reader.onloadend = (readFiles: any) => {
                        this.logo.preview = readFiles.target.result;
                    };
                }
            }
        } else {
            this.logo.extensionErr = false;
            this.logo.sizeErr = false;
            this.logo.heightWidthErr = false;
        }
    }

    getLetterTemplateOfDivision(company_id, division_id, name): void {
        this.divisionService.getLetterTemplateOfDivision({
            company_id, division_id, name
        }).subscribe(res => {
            if (name == 'Client Invoice') {
                this.clientLetterTemplateList = res;
            } else {
                this.providerLetterTemplateList = res;
            }
        })
    }

    setSubHeading() {
        this.subHeading = "Example: ";
        let checkSub = "";
        if (this.divisionForm.controls['print_transcript_in_deponent_subheadings'].value == 1) {
            this.subHeading = this.subHeading + " Original Transcript ";
            checkSub = "of";
        }
        if (this.divisionForm.controls['print_job_type_in_deponent_subheadings'].value == 1) {
            this.subHeading = this.subHeading + " Deposition";
            checkSub = "of";
        }
        this.subHeading = this.subHeading + " " + checkSub + " John Doe ";
        if (this.divisionForm.controls['print_volumn_number_in_deponent_subheadings'].value == 1) {
            this.subHeading = this.subHeading + " Vol: II";
            checkSub = "1";
        }
        if (checkSub == "") {
            this.subHeading = "Example: John Doe";
        }
    }

    getDivisionData() {
        this.divisionService.getDivisionData(this.division_id).subscribe(res => {
            this.divisionData = res;
            this.company_id = this.divisionData.company_id;
            if (this.divisionData) {
                this.divisionForm.addControl('default_client_invoice_letter_template', new FormControl('0'));
                this.divisionForm.addControl('default_provider_invoice_letter_template', new FormControl('0'));
                this.getLetterTemplateOfDivision(this.divisionData.company_id, this.divisionData.division_id, 'Service Provider Invoice');
                this.getLetterTemplateOfDivision(this.divisionData.company_id, this.divisionData.division_id, 'Client Invoice')
                this.getJobTypeData(this.divisionData.company_id, this.divisionData.division_type_id);
                this.divisionForm.patchValue({
                    division_type_id: this.divisionData.division_type_id,
                    name: this.divisionData.name,
                    division_code: this.divisionData.division_code,
                    phone: this.divisionData.phone,
                    default_time_zone_id: this.divisionData.default_time_zone_id,
                    default_client_address_type_id: this.divisionData.default_client_address_type_id,
                    default_billing_address_type_id: this.divisionData.default_billing_address_type_id,

                    default_job_type_id: this.divisionData.default_job_type_id,
                    include_files_notices_on_production_worksheet: this.divisionData.include_files_notices_on_production_worksheet,
                    exclude_weekends_and_holidays_hours: this.divisionData.exclude_weekends_and_holidays_hours,
                    show_jobs_service_providers_x_hours_before_job: (this.divisionData.show_jobs_service_providers_x_hours_before_job) ? this.divisionData.show_jobs_service_providers_x_hours_before_job : '',
                    show_jobs_service_providers_after_client_confirms: this.divisionData.show_jobs_service_providers_after_client_confirms,
                    show_previous_providers_of_case_on_jobs: this.divisionData.show_previous_providers_of_case_on_jobs,
                    provider_confirm_job_hours_before_start_time: (this.divisionData.provider_confirm_job_hours_before_start_time) ? this.divisionData.provider_confirm_job_hours_before_start_time : '',
                    confirmation_can_take_positive: this.divisionData.confirmation_can_take_positive,
                    confirmation_can_take_negative: this.divisionData.confirmation_can_take_negative,
                    hide_public_notes_for_check_in: this.divisionData.hide_public_notes_for_check_in,
                    default_checkout_deliverby_date_to_job_deliverby_date: this.divisionData.default_checkout_deliverby_date_to_job_deliverby_date,
                    hide_expense_section_on_worksheet: this.divisionData.hide_expense_section_on_worksheet,
                    service_provider_time_off_notice_hours: (this.divisionData.service_provider_time_off_notice_hours) ? this.divisionData.service_provider_time_off_notice_hours : '',
                    default_notice_hours: (this.divisionData.default_notice_hours) ? this.divisionData.default_notice_hours : '',
                    hide_service_provider_on_jobs: this.divisionData.hide_service_provider_on_jobs,
                    contact_confirm_job_hours_before_start_time: (this.divisionData.contact_confirm_job_hours_before_start_time) ? this.divisionData.contact_confirm_job_hours_before_start_time : '',
                    hide_insurance_information_on_jobs: this.divisionData.hide_insurance_information_on_jobs,
                    opposing_counsel_have_access_to_jobs: this.divisionData.opposing_counsel_have_access_to_jobs,
                    file_search: this.divisionData.file_search,
                    rapid_transcript_access: this.divisionData.rapid_transcript_access,

                    deponent_sorted: this.divisionData.deponent_sorted,

                    allow_scheduling_requests_by_account_holders: this.divisionData.allow_scheduling_requests_by_account_holders,
                    allow_scheduling_requests_by_unknown_users: this.divisionData.allow_scheduling_requests_by_unknown_users,
                    allow_rapid_requests_by_account_holders: this.divisionData.allow_rapid_requests_by_account_holders,
                    allow_rapid_requests_by_unknown_users: this.divisionData.allow_rapid_requests_by_unknown_users,
                    require_notice_file_on_rapid_requests: this.divisionData.require_notice_file_on_rapid_requests,
                    rapid_request_other_information_label: this.divisionData.rapid_request_other_information_label,

                    default_invoice_term_id: this.divisionData.default_invoice_term_id,
                    allow_quick_pay: this.divisionData.allow_quick_pay,
                    default_invoice_print_type_id: this.divisionData.default_invoice_print_type_id,

                    print_transcript_in_deponent_subheadings: this.divisionData.print_transcript_in_deponent_subheadings,
                    print_job_type_in_deponent_subheadings: this.divisionData.print_job_type_in_deponent_subheadings,
                    print_volumn_number_in_deponent_subheadings: this.divisionData.print_volumn_number_in_deponent_subheadings,
                    default_client_invoice_letter_template: this.divisionData.default_client_invoice_letter_template,
                    default_provider_invoice_letter_template: this.divisionData.default_provider_invoice_letter_template,
                    group_by_deponent: this.divisionData.group_by_deponent,

                    invoice_interest_line_item_text: this.divisionData.invoice_interest_line_item_text,
                    interest_days: (this.divisionData.interest_days) ? this.divisionData.interest_days : '',
                    print_invoice_text: (this.divisionData.print_invoice_text) ? "1" : "0",
                    invoice_charge_type_id: this.divisionData.invoice_charge_type_id,
                    default_finance_charge: (this.divisionData.default_finance_charge) ? this.divisionData.default_finance_charge : '',

                    statements_based_on_date: (this.divisionData.statements_based_on_date) ? "1" : "0",
                    aging_bucket_based_on_date: (this.divisionData.aging_bucket_based_on_date) ? "1" : "0",

                    default_confirmation_status_id: this.divisionData.default_confirmation_status_id
                });

                if (this.divisionData.report_logo) {
                    this.getDivisionLogoImage();
                }
                if (this.divisionData && this.divisionData.file_search_fee && this.divisionData.file_search_fee != '0.00') {
                    this.divisionForm.controls['file_search'].enable();
                }
                if (this.divisionData && this.divisionData.rapid_transcript_fee && this.divisionData.rapid_transcript_fee != '0.00') {
                    this.divisionForm.controls['rapid_transcript_access'].enable();
                }

                if (this.companyData && !this.companyData['integrate_solaria']) {
                    this.divisionForm.patchValue({ calculate_of_deliver_by_date_excludes_weekends_holidays: this.divisionData.calculate_of_deliver_by_date_excludes_weekends_holidays });
                }
                if (this.companyData && this.companyData['use_product_tax_templates']) {
                    this.divisionForm.patchValue({ print_tax_indicator_or_amount: (this.divisionData.print_tax_indicator_or_amount) ? "1" : "0" });
                    this.divisionForm.patchValue({ tax_column_name: this.divisionData.tax_column_name });
                }
                this.setSubHeading();
            }
        }, err => {
            this.toastrService.error(err);
            this.router.navigate(['/settings/division/list']);
        });
    }

    getDivisionLogoImage(): void {
        this.divisionService.getDivisionLogoImage({ division_id: this.division_id, logo_type: 'report' }).subscribe(res => {
            this.logo.url = res.url;
        })
    }

    cancel() {
        if (this.division_id)
            this.router.navigate(['/settings/division/view/', this.division_id]);
        else
            this.router.navigate(['/settings/division/list']);
    }


    setTab(event) {
        let tabList = this.tabset.tabs;
        for(const [index, t] of tabList.entries()) {
            if (index != 0 && (event.target.outerText == t.heading)) {
                this.router.navigate(['/settings/division/' + this.division_id + '/company/' + this.divisionData.company_id + '/' + t.id]);
                return false;
            }
        }
    }

    submitForm($ev, value) {
        this.isSubmitted = true;
        $ev.preventDefault();
        if (this.divisionForm.valid) {
            const formdata: FormData = new FormData();
            if (this.logo.extensionErr || this.logo.sizeErr || this.logo.heightWidthErr) {
                return false;
            }
            this.btnDisabled = true;
            if (!this.divisionForm.controls['company_id']) {
                formdata.append('company_id', this.company_id);
            }
            for (const key in value) {
                if (key !== "report_logo") {
                    formdata.append(key, value[key]);
                }
            }
            if (this.logo.url && this.logo.preview) {
                formdata.append('reportLogo', this.logo.url);
            }
            if (this.division_id) {
                formdata.append('report_logo', this.divisionData.report_logo);
                this.divisionService.updateDivision(this.division_id, formdata).subscribe(
                    res => {
                        this.btnDisabled = false;
                        this.toastrService.success(res.message);
                        this.router.navigate(['/settings/division/view/' + this.division_id]);
                    }, err => {
                        this.btnDisabled = false;
                        this.toastrService.error(err);
                    });
            } else {
                this.divisionService.addDivision(formdata).subscribe(
                    res => {
                        this.btnDisabled = false;
                        this.toastrService.success(res.message);
                        this.router.navigate(['/settings/division/' + res.division_id + '/company/' + this.company_id + '/addressList']);
                    }, err => {
                        this.btnDisabled = false;
                        this.toastrService.error(err);
                    });
            }
        }
    }
}