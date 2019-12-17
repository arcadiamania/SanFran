import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { ActivatedRoute } from '@angular/router';//C2,20
import { 
	FormBuilder,
	Validators 
} from '@angular/forms';//c4, 8
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
	mapSrc;
	
	private const sHID = 'b_id';
	sesStoID = this.sHID + '_page';
	
	reviewForm;//c4, 8
	
	constructor(//C2,6
		private webService: WebService,
		private route: ActivatedRoute,//C2,20
		private formBuilder: FormBuilder,//c4, 8
		private authService: AuthService,
		public sanitizer: DomSanitizer
	){
		//this.mapSrc = this.sanitizer.bypassSecurityTrustResourceUrl('https://maps.google.com/maps?q=1740%20fillmore%20St%2C%20San%20Francisco%2C%2094115&t=k&z=19&ie=UTF8&iwloc=&output=embed');
	}
	
	/*C3,3
	async ngOnInit(){//C2,6
		var response = await this.webService.getBusiness(this.route.snapshot.params.id);//C2,16 //C2,20
		this.business_list = [response];//C2,16
	}*/
	
	ngOnInit(){
		console.log('this.sesStoID',this.sesStoID)
		this.reviewForm = this.formBuilder.group({
			name: ['', Validators.required],
			review: ['', Validators.required],
			stars: 5
		});//c4 8
		
		this.sesStoID = this.sHID + '_' + this.route.snapshot.params[this.sHID] + '_page';
		
		if (sessionStorage[this.sesStoID] && sessionStorage[this.sesStoID] > 0){
			this.page[this.sesStoID] = sessionStorage[this.sesStoID];
		}
		
		console.log(['sessionStorage',sessionStorage])
		
		this.webService.getBusiness({
			//'page': this.page,
			[this.sHID]: this.route.snapshot.params[this.sHID],
			'map': true
		});
		
		
		this.webService.getReviews({
			'page': this.page[this.sesStoID],
			[this.sHID]: this.route.snapshot.params[this.sHID]
		});
		
		console.log(this.webService[this.sHID].list)
	}//C3,10
	
	onSubmit(){
		//console.log(this.reviewForm.value);
		this.webService.postReview({
			'review': this.reviewForm.value
		});
		this.reviewForm.reset();
	}
	
	isInvalid(control){
		return this.reviewForm.controls[control].invalid 
			&& this.reviewForm.controls[control].touched;
	}
	
	isUntouched() {
		return this.reviewForm.controls.name.pristine 
			|| this.reviewForm.controls.review.pristine;
	}
	
	isIncomplete() {
		return this.isInvalid('name') 
			|| this.isInvalid('review') 
			|| this.isUntouched();
	}
	//C3,10 business_list;//C2,16
	changePage(aPageNav){
		console.log(['changePage() success', obj1])
	}
	pageCheck(aPageNav, classCheck){
		
	}
	
	nextPage(){
		let pageN = this.webService.r.canNextPage(this.page[this.sesStoID]);
		console.log(pageN)
		
		if (pageN){
			this.page[this.sesStoID] = pageN;
			sessionStorage[this.sesStoID] = pageN;
			this.webService.getReviews({
				[this.sHID]: this.route.snapshot.params[this.sHID],
				'page':pageN
			});
		}
	}
	
	previousPage(){
		let pageN = this.webService.r.canPreviousPage(this.page[this.sesStoID]);
		console.log(pageN)
		
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
