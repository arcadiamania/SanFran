import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { FormBuilder, Validators } from '@angular/forms';//c4, 8
import { AuthService } from './auth.service';



@Component({
  selector: 'businesses',
  templateUrl: './businesses.component.html',
  styleUrls: ['./bootstrap.min.css'],
})
export class BusinessesComponent {
	private sHID = 'b';

  theForm = {};
  private postFields = [{
    'fieldnameForm':  'business_address', 'fieldnameAPI':   'business_address','defaultVal': '','hasValidation': true},{
    'fieldnameForm':  'business_city', 'fieldnameAPI':   'business_city','defaultVal': '','hasValidation': true},{
    'fieldnameForm':  'business_name', 'fieldnameAPI':   'business_name','defaultVal': '','hasValidation': true},{
    'fieldnameForm':  'business_postal_code', 'fieldnameAPI':   'business_postal_code','defaultVal': '','hasValidation': true},{

    'fieldnameForm':  'ownership_name', 'fieldnameAPI':   'ownership_name','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'business_account_number', 'fieldnameAPI':   'business_account_number','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'business_id', 'fieldnameAPI':   'business_id','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'business_latitude', 'fieldnameAPI':   'business_latitude','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'business_longitude', 'fieldnameAPI':   'business_longitude','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'business_phone_number', 'fieldnameAPI':   'business_phone_number','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'business_start_date', 'fieldnameAPI':   'business_start_date','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'business_state', 'fieldnameAPI':   'business_state','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'mail_address', 'fieldnameAPI':   'mail_address','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'mail_city', 'fieldnameAPI':   'mail_city','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'mail_state', 'fieldnameAPI':   'mail_state','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'mail_zipcode', 'fieldnameAPI':   'mail_zipcode','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'naics_code_description', 'fieldnameAPI':   'naics_code_description','defaultVal': '','hasValidation': false},{
    'fieldnameForm':  'supervisor_district', 'fieldnameAPI':   'supervisor_district', 'defaultVal': '','hasValidation': false}
  ];

	sesStoID = this.sHID + '_page';

	constructor(//C2,6
		private webService: WebService,
		private formBuilder: FormBuilder,
		private authService: AuthService,

	){}

	ngOnInit(){//console.log('this.sesStoID',this.sesStoID)
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		}//console.log(['sessionStorage',sessionStorage])

		this.webService.getBusinesses({
			'page': this.page[this.sesStoID],
			//'sessionPageName': this.sesStoID,
		});

		this.theForm['b'] = this.webService['b'].setPostForm(this, this.postFields)
	}

	changePage(aPageNav){
		let pageN = aPageNav.pageNumber;

		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getBusinesses({
				[this.sHID]: this.webService[this.sHID].lastID(),//Equaivant to this.route.snapshot.params('b_id')
				'page':pageN
			});
		}
	}

	page={[this.sHID +'_page']:1};
}
