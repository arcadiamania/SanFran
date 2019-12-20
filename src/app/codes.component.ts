import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { FormBuilder, Validators } from '@angular/forms';//c4, 8
import { ActivatedRoute } from '@angular/router';//C2,20
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'codes',
  templateUrl: './codes.component.html',
  styleUrls: ['./bootstrap.min.css'],
})
export class CodesComponent {
	private sHID = 'c';

	sesStoID = this.sHID + '_page';

	constructor(//C2,6
		private webService: WebService,
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,//C2,20
		public sanitizer: DomSanitizer
	){}

	ngOnInit(){//console.log('this.sesStoID',this.sesStoID)
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		}//console.log(['sessionStorage',sessionStorage])

		this.webService.getCodes({
			'page': this.page[this.sesStoID],
			snapshot: this.route.snapshot,
			//'sessionPageName': this.sesStoID,
		});
	}

	changePage(aPageNav){
		console.log(['pageNav',aPageNav,this.webService])
		let pageN = aPageNav.pageNumber;

		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getCodes({
				[this.sHID]: this.webService[this.sHID].lastID(),//Equaivant to this.route.snapshot.params('b_id')
				'page':pageN,
			});
		}
	}

	page={[this.sHID +'_page']:1};
}
