import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { ActivatedRoute } from '@angular/router';//C2,20
import { FormBuilder, Validators,FormGroup } from '@angular/forms';//c4, 8
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
	private sHID = 'b_id';
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
	
	theForm = {
		'r':new FormGroup(),
	};
	sesStoID = this.sHID + '_page';
	
	constructor(//C2,6
		private webService: WebService,
		private route: ActivatedRoute,//C2,20
		private formBuilder: FormBuilder,//c4, 8
		private authService: AuthService,
		public sanitizer: DomSanitizer
	){}
	
	ngOnInit(){
		console.log(this['formBuilder']['group']({}))
		this.sesStoID = this.sHID + '_' + this.route.snapshot.params[this.sHID] + '_page';
		
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		} else {//Page needs to be created/chnages to valid val (may be a mistake if there are no reviews)
			sessionStorage[this.sesStoID] = this.page[this.sesStoID];
		}
		
		this.webService.getBusiness({
			snapshot: this.route.snapshot,
			[this.sHID]: this.route.snapshot.params[this.sHID],
			'map': true
		});
		this.webService.getReviews({//Only pass sessionPageName to subDocuments of sHID since that's what needs pagenation
			'page': this.page[this.sesStoID],
			//'sessionPageName': this.sesStoID,
		});
		/*this.webService.getInspections({//Only pass sessionPageName to subDocuments of sHID since that's what needs pagenation
			'page': this.page[this.sesStoID],
			//'sessionPageName': this.sesStoID,
		});*/
		//From this point, the updated sHID:b_id and sHID:r are available
		
		//console.log(this.route.snapshot.params[this.sHID] == this.webService.r.lastID())

		console.log(['busness thForm',this.webService.r,this,this.postFields])
		this.theForm.r = this.webService.r.setPostForm(this, this.postFields)
	}
	
	changePage(aPageNav){
		let pageN = aPageNav.pageNumber;
		
		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getReviews({
				'page':pageN
			});
		}
	}
	
	page={[this.sHID + (('_'+this.route.snapshot.params[this.sHID])+'_page')]:1};
}
