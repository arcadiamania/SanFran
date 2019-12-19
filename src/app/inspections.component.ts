import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { ActivatedRoute } from '@angular/router';//C2,20
import { FormBuilder, Validators } from '@angular/forms';//c4, 8
import { AuthService } from './auth.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({//C2,16
  selector: 'inspections',
  templateUrl: './inspections.component.html',
  styleUrls: [
	'./inspections.component.css'
  ]
})

export class InspectionsComponent {
	private sHID = 'i';
	sesStoID = this.sHID + '_page';
	
	vForm;//c4, 8
	
	
	constructor(//C2,6
		private webService: WebService,
		private route: ActivatedRoute,//C2,20
		private formBuilder: FormBuilder,//c4, 8
		private authService: AuthService,
		public sanitizer: DomSanitizer
	){}
	
	private postFields = [{
			'fieldnameForm': 'v_id',//name
			'fieldnameAPI': 'violation_id',
			'defaultVal': '',
			'hasValidation': true
		},{
			'fieldnameForm': 'v_description',//review
			'fieldnameAPI': 'violation_description',
			'defaultVal': '',
			'hasValidation': true
		},{
			'fieldnameForm': 'v_risk',//stars
			'fieldnameAPI': 'risk_category',
			'defaultVal': '',
			'hasValidation': true
		}
	];
	
	ngOnInit(){
		//console.log('this.sesStoID',this.sesStoID)
		let group = {}
		for (let p_f of this.postFields){
			group[p_f.fieldnameForm] = (p_f.hasValidation) ? [p_f.defaultVal, Validators.required] : p_f.defaultVal;
		}
		this.vForm = this.formBuilder.group(group);//c4 8
		
		this.sesStoID = this.sHID + '_' + this.route.snapshot.params[this.sHID] + '_page';
		
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		}
		
		//console.log(['sessionStorage',sessionStorage])
		
		this.webService.getInspections({
			[this.sHID]: this.route.snapshot.params[this.sHID],
		});
		
		
		this.webService.getViolation(/*{
			'page': this.page[this.sesStoID],
			[this.sHID]: this.route.snapshot.params[this.sHID]
		}*/);
		
		//console.log(this.webService[this.sHID].list)
	}//C3,10
	
	onSubmit(){
		console.log('in onSubmit()')
		let formData = this.vForm; //Really want to this[targetSHID]Form
		let targetSHID = 'v'
		
		
		let params = {
			'formValue': formData.value,
			'reqFields': this.postFields,
			'sHID': targetSHID,
		};
		
		console.log(['onSubmit() vals before post',formData,targetSHID,params] )
		
		this.webService['postForm'](params);
		
		formData.reset();
	};
	
	isInvalid(control){
		return this.vForm.controls[control].invalid && this.vForm.controls[control].touched;
	}
	isUntouched() {
		let untouched = false;
		for (let p_f of this.postFields){
			if (p_f.hasValidation){
				untouched = untouched || this.vForm.controls[p_f.fieldnameForm].pristine
			}
		}
		return untouched;
	} 
	isIncomplete() {
		let incomplete = false;
		for (let p_f of this.postFields){
			if (p_f.hasValidation){
				incomplete = incomplete || this.isInvalid(p_f.fieldnameForm);
			} 
		}
		incomplete = incomplete || this.isUntouched();
		return incomplete;
	}
	
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
