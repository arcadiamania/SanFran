import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5

@Component({
  selector: 'businesses',
  templateUrl: './businesses.component.html',
  styleUrls: ['./businesses.component.css']
})
export class BusinessesComponent {
	private const sHID = 'b';
	sesStoID = this.sHID + '_page';
	
	constructor(//C2,6
		private webService: WebService
	){}
	
	ngOnInit(){//C2,6
		console.log('this.sesStoID',this.sesStoID)
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		}
		console.log(['sessionStorage',sessionStorage])
		
		this.webService.getBusinesses({
			'page': this.page[this.sesStoID]
		});
	}
	
	/*nextPage(){
		let pageN = this.webService[this.sHID].canNextPage(this.page);
		
		if (pageN){
			this.page = pageN;
			sessionStorage.page = pageN;
			this.webService.getBusinesses({'page':pageN});
		}
	}
	
	previousPage(){
		let pageN = this.webService[this.sHID].canPreviousPage(this.page);
		
		if (pageN){
			this.page = pageN;
			sessionStorage.page = pageN;
			this.webService.getBusinesses({'page':pageN});
		}
	}*/
	
	nextPage(){
		let pageN = this.webService[this.sHID].canNextPage(this.page[this.sesStoID]);
		console.log(pageN)
		
		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getBusinesses({
				'page':pageN
			});
		}
	}
	
	previousPage(){
		let pageN = this.webService[this.sHID].canPreviousPage(this.page[this.sesStoID]);
		console.log(pageN)
		
		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getBusinesses({
				'page':pageN
			});
		}
	}
	
	page={[this.sHID +'_page']:1};
}
