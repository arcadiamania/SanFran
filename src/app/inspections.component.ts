import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { ActivatedRoute } from '@angular/router';//C2,20
import { FormBuilder, Validators } from '@angular/forms';//c4, 8
import { AuthService } from './auth.service';
import { DomSanitizer } from '@angular/platform-browser';


@Component({//C2,16
  selector: 'inspections',
  templateUrl: './inspections.component.html',
  styleUrls: ['./bootstrap.min.css'],
})

export class InspectionsComponent {
	private sHID = 'i';

	theForm = {};
	sesStoID = this.sHID + '_page';


	constructor(//C2,6
		private webService: WebService,
		private route: ActivatedRoute,//C2,20
		private formBuilder: FormBuilder,//c4, 8
		private authService: AuthService,
		public sanitizer: DomSanitizer
	){}

	private postFields = [{
			'fieldnameForm': 'in_date',//name
			'fieldnameAPI': 'inspection_date',
			'defaultVal': '',
			'hasValidation': true
		},{
			'fieldnameForm': 'in_id',//review
			'fieldnameAPI': 'inspection_id',
			'defaultVal': '',
			'hasValidation': true
		},{
			'fieldnameForm': 'in_score',//stars
			'fieldnameAPI': 'inspection_score',
			'defaultVal': '',
			'hasValidation': true
		},{
			'fieldnameForm': 'in_type',//stars
			'fieldnameAPI': 'inspection_type',
			'defaultVal': '',
			'hasValidation': true
		}
	];

	ngOnInit(){
		this.sesStoID = this.sHID + '_' + this.route.snapshot.params['b_id'] + '_page';

		console.log([this.sesStoID,sessionStorage[this.sesStoID]])

		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		} else {//Page needs to be created/chnages to valid val (may be a mistake if there are no reviews)
			sessionStorage[this.sesStoID] = this.page[this.sesStoID];
		}

		//console.log(['sessionStorage',sessionStorage])

		console.log(['this.route.snapshot',this.route.snapshot])

		this.webService.getInspections({//Only pass sessionPageName to subDocuments of sHID since that's what needs pagenation
			snapshot: this.route.snapshot,
			'page': this.page[this.sesStoID],
		});
		//console.log(this.webService.getSHFromURL('http://localhost:4200/businesses/5dee77c28124f41ab81441fe'))

		//this.theForm['i_id'] = this.webService['i_id'].setPostForm(this, this.postFields)
	}//C3,10
	onInspectionSubmit(){console.log(['onInspectionSubmit()'])}
	onViolationSubmit(){console.log(['onViolationSubmit()'])}
	setViolation(url){
	  /*var returns = this.webService.getSHFromURL(url)
	  var subject = returns[1]
	  var helper = returns[0]*/

	  console.log(['setViolation url', url])

	  this.webService.deleteByURL(url)


    //console.log(this.webService.http.get(url))
	  /*this.webService.getSHFromURL(url, function(_helper){
	  #  console.log(['_helper about to delete using this as:', this]);
	  #  this.delete();
	  #});*/



	}
	setInspection(a){
	  console.log(['setInspection()',a,b])
	  this.webService.getSHFromURL(url, function(_helper){console.log('_helper');_helper.delete()})

	}

	changePage(aPageNav){
		let pageN = aPageNav.pageNumber;

		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getInspections({//Only pass sessionPageName to subDocuments of sHID since that's what needs pagenation
        snapshot: this.route.snapshot,
        'page': this.page[this.sesStoID],
      });
		}
	}

	page={[this.sHID + (('_'+this.route.snapshot.params[this.sHID])+'_page')]:1};
}
