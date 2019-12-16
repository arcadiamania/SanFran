import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5

@Component({
  selector: 'businesses',
  templateUrl: './businesses.component.html',
  styleUrls: ['./businesses.component.css']
})
export class BusinessesComponent {
	
	constructor(//C2,6
		private webService: WebService
	){}
	
	ngOnInit(){//C2,6
		if (sessionStorage.page){
			this.page = sessionStorage.page;
		}
		this.webService.getBusinesses(this.page);//C3,4 //C3,11
		/*C3,9
		this.webService.business_list.subscribe(businesses => {//C3,9
			this.business_list = businesses
		});//C3,7*/
		
		
		/*C3,4
		var response = await this.webService.getBusinesses();//C2,9
		//console.log(response);//C2,9
		this.business_list = response;*/
	}
	
	nextPage(){
		//Implemnt chech to avoid last page - See c3,12ish
		this.page = Number(this.page) + 1;
		sessionStorage.page = Number(this.page);
		this.webService.getBusinesses(this.page);
	}
	
	previousPage(){
		if(this.page > 1){
			this.page = Number(this.page) - 1;
			sessionStorage.page = Number(this.page);
			this.webService.getBusinesses(this.page);
		}
	}
	
	page=1;
	//business_list = [];//C2,5
	//C3,9 business_list;//C2,10
	
	
  /*business_list = [
	 { "name": "Pizza Place", "city": "Coleriane", "review_count": 10 },
	 { "name": "Wine Lake", "city": "Ballymoney", "review_count": 7 },
	 { "name": "Beer Tavern", "city": "Ballymena", "review_count": 12 }
 ];*/
}
