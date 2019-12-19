import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { ActivatedRoute } from '@angular/router';//C2,20
import { FormBuilder, Validators } from '@angular/forms';//c4, 8
import { AuthService } from './auth.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({//C2,16
  selector: 'inspection',
  templateUrl: './inspection.component.html',
  styleUrls: [
	'./inspection.component.css'
  ]
})

export class InspectionComponent {
	private sHID = 'i_id';
	private postFields = [{
			'fieldnameForm': 'v_name',
			'fieldnameAPI': 'violation_id',
			'defaultVal': '',//Chnage to date?
			'hasValidation': true
		},{
			'fieldnameForm': 'v_desc',
			'fieldnameAPI': 'violation_description',
			'defaultVal': '',
			'hasValidation': true
		},{
			'fieldnameForm': 'v_risk',
			'fieldnameAPI': 'risk_category',
			'defaultVal': 'Low Risk',
			'hasValidation': false
		}
	];
	
	theForm = {};
	sesStoID = this.sHID + '_page';
	
	constructor(//C2,6
		private webService: WebService,
		private route: ActivatedRoute,//C2,20
		private formBuilder: FormBuilder,//c4, 8
		private authService: AuthService,
		public sanitizer: DomSanitizer
	){}
	
	ngOnInit(){
		
		console.log(['getInspection(params)', this.route.snapshot])
		this.sesStoID = this.sHID + '_' + this.route.snapshot.params[this.sHID] + '_page';
		
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		} else {//Page needs to be created/chnages to valid val (may be a mistake if there are no reviews)
			sessionStorage[this.sesStoID] = this.page[this.sesStoID];
		}
		
		this.webService.getInspection({
			[this.sHID]: this.route.snapshot.params[this.sHID],
			snapshot: this.route.snapshot
			
		});
		this.webService.getViolations({//Only pass sessionPageName to subDocuments of sHID since that's what needs pagenation
			'page': this.page[this.sesStoID],
		});
		//From this point, the updated sHID:b_id and sHID:r are available

		
		this.theForm['v'] = this.webService['v'].setPostForm(this, this.postFields)
	}
	
	changePage(aPageNav){
		let pageN = aPageNav.pageNumber;
		
		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getViolations({
				'page':pageN
			});
		}
	}
	
	page={[this.sHID + (('_'+this.route.snapshot.params[this.sHID])+'_page')]:1};
}
