/*
FOR C4 to work
Need to remove the @jwt_required decoratort from post request on review and buisness for the time being


*/

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';//C3,6

@Injectable()
export class WebService {
	private business_private_list;//C3,8
	private businessesSubject = new Subject();//C3,6//C3,8
	business_list = this.businessesSubject.asObservable();//C3,8
	
	//private business_private_list;//C3, from michel email
	private businessSubject = new Subject();
	business = this.businessSubject.asObservable();
	
	private reviews_private_list;//C4 2,3?
	private reviewsSubject = new Subject();
	reviews_list = this.reviewsSubject.asObservable();
	
	businessID;
	
	constructor(
		private http: HttpClient
	){}
	
	getBusinesses(page){
		return this.http.get(
			'http://localhost:5000/api/v1.0/businesses?pn='+page
		).subscribe(response => {
			console.log(response)
			this.business_private_list = response; //C3,8
			this.businessesSubject.next(this.business_private_list);//C3,6//C3,8
		});//C3,4
		
		
		//C3,3 .toPromise();
	}
	
	/*C3,2
	getBusiness(id){//C2,17
		return this.http.get(
			'http://localhost:5000/api/v1.0/businesses/'+id
		).toPromise();
	}*/
	
	getBusiness(id){//C3,10
		return this.http.get(
			'http://localhost:5000/api/v1.0/businesses/'+id
		).subscribe(response => {
			console.log(response)
			this.business_private_list = [response];
			//this.business_private_list.push(response.json());
			console.log(this.business_private_list)
			this.businessSubject.next(this.business_private_list);//C3, from michel email
			this.businessID = id;
		});
	}
	 getReviews(id) {
		 return this.http.get(
				 'http://localhost:5000/api/v1.0/businesses/' + id + '/reviews'
			).subscribe(
				 response => {
					 this.reviews_private_list = response;
					 this.reviewsSubject.next(
						this.reviews_private_list
					 );
			 }
		 )
	}
	
	postReview(review) {
		let postData = new FormData();
		postData.append("username", review.name);
		postData.append("text", review.review);
		postData.append("stars", review.stars);
		
		let today = new Date();
		let todayDate = today.getFullYear() 
			+ "-" + today.getMonth() 
			+ "-" + today.getDate();
		postData.append("date", todayDate);
		
		this.http.post(
			'http://localhost:5000/api/v1.0/businesses/' + this.businessID + '/reviews', postData
		).subscribe(
			response => {
				this.getReviews(this.businessID);
			} 
		);
	}
}