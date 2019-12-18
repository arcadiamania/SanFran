import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { ActivatedRoute } from '@angular/router';//C2,20
import { FormBuilder, Validators } from '@angular/forms';//c4, 8
import { AuthService } from './auth.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({//C2,16
  selector: 'business',
  templateUrl: './business.component.html',
  styleUrls: [
	'./business.component.css'
  ]
})

export class BusinessComponent {
	private const sHID = 'b_id';
	
	theForm;
	//rForm;
	
	private postFields = [{
			'fieldnameForm': 'name',
			'fieldnameAPI': 'username',
			'defaultVal': '',
			'hasValidation': true
		},{
			'fieldnameForm': 'review',
			'fieldnameAPI': 'text',
			'defaultVal': '',
			'hasValidation': true
		},{
			'fieldnameForm': 'stars',
			'fieldnameAPI': 'stars',
			'defaultVal': 5,
			'hasValidation': false
		}
	];
	
	sesStoID = this.sHID + '_page';
	
	constructor(//C2,6
		private webService: WebService,
		private route: ActivatedRoute,//C2,20
		private formBuilder: FormBuilder,//c4, 8
		private authService: AuthService,
		public sanitizer: DomSanitizer
	){}
	
	ngOnInit(){
		this.sesStoID = this.sHID + '_' + this.route.snapshot.params[this.sHID] + '_page';
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		}
		
		this.webService.getBusiness({
			[this.sHID]: this.route.snapshot.params[this.sHID],
			'map': true
		});
		this.webService.getReviews({
			'page': this.page[this.sesStoID],
			[this.sHID]: this.route.snapshot.params[this.sHID]
		});
		
		this.theForm = this.webService.r.setPostForm(this, this.postFields)
	}
	
	/*onSubmit(formSHID){
		let formData = this.rForm; //Really want to this[targetSHID]Form
		let targetSHID = formSHID;
		let params = {'formValue': formData.value,'reqFields': this.postFields,'sHID': targetSHID,};
		his.webService.postForm(params);
		formData.reset();
	};
	isInvalid(control){
		return this.rForm.controls[control].invalid && this.rForm.controls[control].touched;
	}
	isUntouched() {
		let untouched = false;
		for (let p_f of this.postFields){if (p_f.hasValidation){untouched = untouched || this.rForm.controls[p_f.fieldnameForm].pristine}}
		return untouched;
	}
	isIncomplete() {
		let incomplete = false;
		for (let p_f of this.postFields){if (p_f.hasValidation){incomplete = incomplete || this.isInvalid(p_f.fieldnameForm);} }
		incomplete = incomplete || this.isUntouched();
		return incomplete;
	}
	*/
	
	
	changePage(aPageNav){
		let pageN = aPageNav.pageNumber;
		
		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getReviews({
				[this.sHID]: this.route.snapshot.params[this.sHID],
				'page':pageN
			});
		}
	}
	
	page={[this.sHID + (('_'+this.route.snapshot.params[this.sHID])+'_page')]:1};
}
