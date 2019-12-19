import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { FormBuilder, Validators } from '@angular/forms';//c4, 8

@Component({
  selector: 'businesses',
  templateUrl: './businesses.component.html',
  styleUrls: ['./businesses.component.css']
})
export class BusinessesComponent {
	private const sHID = 'b';
	
	sesStoID = this.sHID + '_page';
	
	constructor(//C2,6
		private webService: WebService,
		private formBuilder: FormBuilder
	){}
	
	ngOnInit(){//console.log('this.sesStoID',this.sesStoID)
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		}//console.log(['sessionStorage',sessionStorage])
		
		this.webService.getBusinesses({
			'page': this.page[this.sesStoID],
			//'sessionPageName': this.sesStoID,
		});
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
