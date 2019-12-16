import { Component } from '@angular/core';
import { WebService } from './web.service';//C2,5
import { ActivatedRoute } from '@angular/router';//C2,20
import { 
	FormBuilder,
	Validators 
} from '@angular/forms';//c4, 8
import { AuthService } from './auth.service';

@Component({//C2,16
  selector: 'business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.css']
})
export class BusinessComponent {
	
	reviewForm;//c4, 8
	
	constructor(//C2,6
		private webService: WebService,
		private route: ActivatedRoute,//C2,20
		private formBuilder: FormBuilder,//c4, 8
		private authService: AuthService
	){}
	
	/*C3,3
	async ngOnInit(){//C2,6
		var response = await this.webService.getBusiness(this.route.snapshot.params.id);//C2,16 //C2,20
		this.business_list = [response];//C2,16
	}*/
	
	ngOnInit(){
		this.reviewForm = this.formBuilder.group({
			name: ['', Validators.required],
			review: ['', Validators.required],
			stars: 5
		});//c4 8
		this.webService.getBusiness(this.route.snapshot.params.id);
		this.webService.getReviews(
			this.route.snapshot.params.id
		);//c4 3
	}//C3,10
	
	onSubmit(){
		//console.log(this.reviewForm.value);
		this.webService.postReview(this.reviewForm.value);
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

}
