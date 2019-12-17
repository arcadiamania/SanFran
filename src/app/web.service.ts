/*
FOR C4 to work
Need to remove the @jwt_required decoratort from post request on review and buisness for the time being


*/

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';//C3,6



@Injectable()
export class WebService {
	private serviceStrut = {};
	private serviceShorthand = ['b','b_id','r','r_id','i','i_id','v','v_id'];
	const root = 'http://localhost:5000/api/v1.0';
	
	constructor(private http: HttpClient){
		for (let s_name of this.serviceShorthand){
			this.serviceStrut[s_name] = new this.serviceHelper(s_name, this.root);
			this.serviceStrut[s_name].setSelf(this.serviceStrut[s_name]);
			
		};
	}
	
	//A data storage structure to help minimize code - will implement for loop if it gets any larger
	private serviceHelper = function(name, root){
		var _private_list;
		var _subject = new Subject();
		this.list = _subject.asObservable();
		
		//var _private_pages = [];
		//var _nav_subject = new Subject();
		//this.navPages = _nav_subject.asObservable();
		//this.testNav = [1,2,3,4];
		
		this.navPages = [];
		
		var _path = [];
		var _name = name;
		var _root = root;
		var _self = null;
		var _pagination = {};
		var _hasError = true;
		
		
		
		this.hasResults = false;
		
		
		this.setSelf = function(aSelf){
			if (!_self){
				_self = aSelf;
				return true;
			} else {
				return false;
			}
		};
		this.setResponce = function (res){
			console.log(res);
			
			_hasError = false;
			
			_pagination = {
				'start_index': res.start_index,
				'current_page':res.current_page,
				'last_page':res.last_page,
				'page_size':res.page_size,
				'count':res.count
			};
			
			this.setList(res.results);
			
			if (res.results.length > 0){
				this.hasResults=true;
				if (res.results[0].hasOwnProperty('business_location') && res.results.length <= res.page_size ){
					this.updateLocations();
				};
			}else{
				this.hasResults=false;
			};
			
			this.setPages(3);
			
			console.log(this.navPages)
			
			return _self;
		};
		this.setPath = function (pathList){
			//Supports single literal and array
			_path = (pathList.hasOwnProperty('length')) ? pathList : [pathList];
			return true;
		};
		
		this.name = function(){
			return _name;
		};
		this.setList = function (resultList){
			_private_list = (resultList.hasOwnProperty('length')) ? resultList : [resultList];
			console.log(_private_list)
			return true;
		};
		this.setError = function(error){
			//Avoid setting error as a falsy value... You cheeky sod
			_hasError = (error) ? error : false;
			
			
		}
		this.hasError = function(){
			return _hasError;
		}
		this.next = function (){
			return _subject.next(_private_list);
		};
		//this.nextNav = function (){
		//	return _nav_subject.next(_private_pages);
		//};
		this.path = function (){
			return _path;
		};
		this.pathName = function (){
			return "/"+_path.join('/');
		};
		this.fullPath = function (){
			return _root + this.pathName();
		};
		this.idPath = function (){
			//Assuminging that ID is always the 2n-th item
			let lastIndex = (Math.floor(_path.length / 2) * 2) - 1;
			let idPaths = [];
			
			for (let i = 1; i <= lastIndex; i += 2){
				idPaths.push(_path[i]);
			};
			
			if (idPaths.length > 0){
				return idPaths;
			} else {
				return false;
			}
		};
		this.lastID = function (){
			let ids = this.idPath();
			return (ids) ? ids[ids.length - 1] : false;
		};
		this.paramObj = function (){
			ids = this.idPath();
			let pObj = {};
			for (i in _path) {
				if (ids.includes(_path[i])){
					let key = _path[i-1].substring(0,1)+'_id';
					pObj[key] = _path[i];
				}
			}
			if (_pagination.current_page){//Pages start at one, rest of values are falsy
				pObj[page] = _pagination.current_page;
			}
			
			return pObj;
		};
		this.canNextPage = function(currentPage, amount){
			if (!this.hasResults || _hasError){return false};
			
			currentPage = (typeof currentPage === "undefined") ? _pagination.current_page : currentPage;
			amount = (typeof amount === "undefined") ? 1 : amount;
			
			console.log([currentPage,amount,_pagination.last_page])
			
			if (currentPage + amount <= _pagination.last_page){
				return currentPage + amount;
			} else {
				return _pagination.last_page;
			}
		};
		this.canPreviousPage = function(currentPage, amount){
			if (!this.hasResults || _hasError){return false};
			
			currentPage = (typeof currentPage === "undefined") ? _pagination.current_page : currentPage;
			amount = (typeof amount === "undefined") ? 1 : amount;
			
			if (currentPage - amount >= 1){
				return currentPage - amount;
			} else {
				return 1;
			}
		};
		this.setPages = function (pageDistance){//pageDistance as n, is n+1+n of max pages
			if (!this.hasResults || _hasError){return false};
			
			let pageList = [];
			pageDistance = (typeof pageDistance === "undefined") ? 3 : pageDistance;
			let currentPage = _pagination.current_page;
			let lastPage = _pagination.last_page
			
			//Ensure using valid page - TODO check if no results can pass other validation
			currentPage = (currentPage <= lastPage) ? currentPage : lastPage;
			currentPage = (currentPage >= 1) ? currentPage : 1;
			
			let pagStart = this.canPreviousPage(currentPage, pageDistance);
			let pagEnd = this.canNextPage(currentPage, pageDistance);
			
			if (pagStart != currentPage){
				pageList.push({
					'pageText': 'Previous',
					'pageNumber': currentPage-1,
					'isPageObj':false,
					'isNextObj':false,
					'isPreviousObj':true,
					'isFirst': (currentPage-1 == 1) ? true : false,
					'isCurrent': false,
					'isLast': (currentPage-1 == lastPage) ? true : false,
				});
			}
			for (let p_i = pagStart; p_i <= pagEnd; p_i++){
				let pageObj = {
					'pageText': p_i.toString(),
					'pageNumber': p_i,
					'isPageObj':true,
					'isNextObj':false,
					'isPreviousObj':false,
					'isFirst': (p_i == 1) ? true : false,
					'isCurrent': (p_i == currentPage) ? true : false,
					'isLast': (p_i == lastPage) ? true : false,
				}
				pageList.push(pageObj);
			}
			if (pagEnd != currentPage){
				pageList.push({
					'pageText': 'Next',
					'pageNumber': currentPage+1,
					'isPageObj':false,
					'isNextObj':true,
					'isPreviousObj':false,
					'isFirst': (currentPage+1 == 1) ? true : false,
					'isCurrent': false,
					'isLast': (currentPage+1 == lastPage) ? true : false,
				});
			}
			
			this.navPages = pageList;
			//_private_pages = pageList;
		}
		
		this.updateLocations = function(objWithLocations){
			if (!this.hasResults || _hasError){return false};
			
			objWithLocations = (typeof objWithLocations === "undefined") ? _private_list : objWithLocations;

			for (let item of objWithLocations){
				let search_term = false;
				if (item['business_latitude'] && item['business_longitude']){
					search_term = item['search_term'] = item['business_latitude']+', '+item['business_longitude']; 
				} else if (item['business_address'] && item['business_city'] && item['business_postal_code']) {
					search_term = item['business_address']+', '+item['business_city']+', '+item['business_postal_code'];
				}
				if (search_term){
					search_term = encodeURIComponent(search_term);
					item['business_location'] = "https://maps.google.com/maps?q="+search_term+"&t=k&z=19&ie=UTF8&iwloc=&output=embed"
					console.log(item['business_location'])
				} else {
					item['business_location'] = null;
				}
			}
			console.log(objWithLocations)
		}
	};
	
	getBusinesses(params){
		let page = params.page;
		this.b = this.serviceStrut.b;
		let helper = this.b;
		helper.setPath(["businesses"]);
		
		return this.http.get(
			helper.fullPath() 
			+ '?pn=' + page
		).subscribe(
			response => {
				console.log(['getBusinesses response',response])
				helper.setResponce(response).next();
				//helper.nextNav();
			},
			error => {
				console.log(error);
				helper.setError(error);
			}//,() => {onCompleted callback}
		);
	}
	getBusiness(params){//C3,10
		let b_id = params.b_id;
		this.b_id = this.serviceStrut.b_id;
		let helper = this.b_id;
		helper.setPath(["businesses",b_id]);
		
		return this.http.get(
			helper.fullPath()
		).subscribe(
			response => {
				console.log(['getBusiness response',response])
				helper.setResponce(response).next();
			},
			error => {
				console.log(error);
				helper.setError(error);
			}//,() => {onCompleted callback}
		);
	}
	getReviews(params){
		let page = params.page;
		let b_id = params.b_id;
		this.r = this.serviceStrut.r;
		let helper = this.r;
		helper.setPath(["businesses",b_id,"reviews"]);
		
		console.log(this.http.get(
			helper.fullPath()
			+ '?pn=' + page
		))
		
		return this.http.get(
			helper.fullPath()
			+ '?pn=' + page
		).subscribe(
			response => {
				console.log(['getReviews response',response])
				helper.setResponce(response).next();
				//helper.nextNav();
			},
			error => {
				console.log(error);
				helper.setError(error);
			}//,() => {onCompleted callback}
		);
	}
	
	postReview(params) {
		let review = params.review;
		//Assume that this.r has already been created - might need a check to ensure
		let postData = new FormData();
		
		req_fields = [ "username", "stars", "text"]
		
		for (r_f of req_fields){
			postData.append(r_f, review[r_f]);
		}
		
		/*postData.append("username", review.name);
		postData.append("text", review.review);
		postData.append("stars", review.stars);*/
		
		//optional could be here
		
		/*let today = new Date();
		let todayDate = today.getFullYear()
			+ "-" + today.getMonth() 
			+ "-" + today.getDate();
		postData.append("date", todayDate);*/
		
		this.http.post(
			this.r.fullPath(), postData
		).subscribe(
			response => {
				this.getReviews(this.r.paramObj());
			} 
		);
	}
}