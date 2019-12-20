/*
FOR C4 to work
Need to remove the @jwt_required decoratort from post request on review and buisness for the time being


*/

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';//C3,6
import { FormBuilder, Validators, FormGroup} from '@angular/forms';



@Injectable()
export class WebService {
	private serviceStrut = {};

	private serviceMapping=[
		{'sHID':'b',	'getFun':this.getBusinesses,	},
		{'sHID':'b_id',	'getFun':this.getBusiness,		},
		{'sHID':'r',	'getFun':this.getReviews,		},
		{'sHID':'r_id',	'getFun':this.getReview,		},
		{'sHID':'i',	'getFun':this.getInspections,	},
		{'sHID':'i_id',	'getFun':this.getInspection,	},
		{'sHID':'v',	'getFun':this.getViolations,	},
		{'sHID':'v_id',	'getFun':this.getViolation,		},
		{'sHID':'c',	'getFun':this.getCodes,	},
	]

	root = 'http://localhost:5000/api/v1.0';
	rootURL = 'http://localhost:4200';

	constructor(private http: HttpClient){
		for (let s_m of this.serviceMapping){
			this.serviceStrut[s_m.sHID] = new this.serviceHelper(s_m.sHID, s_m.getFun, this)//this.root, this.http);
			this.serviceStrut[s_m.sHID].setSelf(this.serviceStrut[s_m.sHID]);

		};
	}

	//A data storage structure to help minimize code - will implement for loop if it gets any larger
	private serviceHelper = function(name, getFun, webService){
	  var _path = [];
		var _name = name;
		var _root = webService.root;
		var _http = webService.http;
		var _self = null;
		var _pagination = {};
		//var _session_page_name = false:
		var _hasError = true;

		var _get = getFun;
		var _post_form = false;
		var _post_fields = [];
		var _web_service = webService;

		this.url;
		this.appURL;
		this.navPages = [];
		this.hasResults = false;

		var _private_list;
		var _subject = new Subject();
		this.list = _subject.asObservable();
		this.setList = function (resultList){
			_private_list = (resultList.hasOwnProperty('length')) ? resultList : [resultList];
			console.log(_private_list)
			return true;
		};
		this.next = function (){
			return _subject.next(_private_list);
		};

    var _subject_path = new Subject();
    this.asyncPath = _subject_path.asObservable();

    this.setPath = function (pathList){
			//Supports single literal and array
			_path = (pathList.hasOwnProperty('length')) ? pathList : [pathList];
			_subject_path.next(_path)

			return true;
		};
    /*this.getPath = function(){
      .subscribe(()=>{})
      //needs to update when a path is updated - could be defined in the serviceHelper constructor - will come back if time
    }*/



		this.setGet = function(getFunction){
			_get = getFunction;
		};
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
				'count':res.count,
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

						this.setPages(3);//Number*2+1 is max pages to display - based on digit

			console.log(this.navPages)
			this.url = this.fullPath();
			this.appURL = 'http://localhost:4200/'+this.pathName()


			return _self;
		};


		this.name = function(){
			return _name;
		};
		this.setError = function(error){
			//Avoid setting error as a falsy value... You cheeky sod
			_hasError = (error) ? error : false;
		}
		this.hasError = function(){
			return _hasError;
		}

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
		  console.log(this.idPath())
			let ids = this.idPath();
			let pObj = {};
			for (let i =0; i < _path.length && ids; i++) {
				if (ids.includes(_path[i])){
					let key = _path[i-1].substring(0,1)+'_id';
					pObj[key] = _path[i];
				}
			}
			pObj['self'] = _self;
			if (_pagination['current_page']){//Pages start at one, rest of values are falsy
				pObj['page'] = _pagination['current_page'];
			}

			return pObj;
		};
		/*this.setSessionPageName = function(sessionPageName){
			_session_page_name = sessionPageName;
		};*/
		this.canNextPage = function(currentPage, amount){
			if (!this.hasResults || _hasError){return false};

			currentPage = (typeof currentPage === "undefined") ? _pagination['current_page'] : currentPage;
			amount = (typeof amount === "undefined") ? 1 : amount;

			//console.log([currentPage,amount,_pagination.last_page])

			if (currentPage + amount <= _pagination['last_page']){
				return currentPage + amount;
			} else {
				return _pagination['last_page'];
			}
		};
		this.canPreviousPage = function(currentPage, amount){
			if (!this.hasResults || _hasError){return false};

			currentPage = (typeof currentPage === "undefined") ? _pagination['current_page'] : currentPage;
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
			let currentPage = _pagination['current_page'];
			let lastPage = _pagination['last_page']

			//Ensure using valid page - TODO check if no results can pass other validation
			currentPage = (currentPage <= lastPage) ? currentPage : lastPage;
			currentPage = (currentPage >= 1) ? currentPage : 1;

			if (lastPage == (currentPage == 1)){
				this.navPages = [{
					'pageText': 'All displayed',
					'pageNumber': 1,
					'isPageObj':true,
					'isNextObj':false,
					'isPreviousObj':false,
					'isFirst': true,
					'isCurrent': true,
					'isLast': true,
				}];
				return;
			}

			let pagStart = this.canPreviousPage(currentPage, pageDistance);
			let pagEnd = this.canNextPage(currentPage, pageDistance);

			if (pagStart != currentPage){
				pageList.push({
					'pageText': '<<',
					'pageNumber': 1,
					'isPageObj':false,
					'isNextObj':false,
					'isPreviousObj':true,
					'isFirst': true,
					'isCurrent': false,
					'isLast': false,
				});
				pageList.push({
					'pageText': '<',
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
					'pageText': '>',
					'pageNumber': currentPage+1,
					'isPageObj':false,
					'isNextObj':true,
					'isPreviousObj':false,
					'isFirst': (currentPage+1 == 1) ? true : false,
					'isCurrent': false,
					'isLast': (currentPage+1 == lastPage) ? true : false,
				});
				pageList.push({
					'pageText': '>>',
					'pageNumber': lastPage,
					'isPageObj':false,
					'isNextObj':true,
					'isPreviousObj':false,
					'isFirst': false,
					'isCurrent': false,
					'isLast': true,
				});
			}

			this.navPages = pageList;
			//_private_pages = pageList;
		}


		this.updateLocations = function(objWithLocations, isTerain){
			if (!this.hasResults || _hasError){return false};

			objWithLocations = (typeof objWithLocations === "undefined") ? _private_list : objWithLocations;

			for (let item of objWithLocations){
				let search_term = '';
				if (item['business_latitude'] && item['business_longitude']){
					search_term = item['search_term'] = item['business_latitude']+', '+item['business_longitude'];
				} else if (item['business_address'] && item['business_city'] && item['business_postal_code']) {
					search_term = item['business_address']+', '+item['business_city']+', '+item['business_postal_code'];
				}
				if (search_term != ''){
					search_term = encodeURIComponent(search_term);
					item['business_location'] = "https://maps.google.com/maps?q="+search_term+((_private_list.length == 1)?'&t=k&z=19':'&z=15')+"&ie=UTF8&iwloc=&output=embed"
					//console.log(item['business_location'])
				} else {
					item['business_location'] = null;
				}
			}
			//console.log(objWithLocations)
		}


		this.setPostForm = function(componentRef, postFields){
			console.log(['componentRef, postFields',componentRef, postFields])
			_post_fields = postFields;

			let group = {}

			for (let p_f of postFields){
				group[p_f['fieldnameForm']] = (p_f.hasValidation) ? [p_f['defaultVal'], Validators.required] : p_f.defaultVal;
			}

			console.log('componentRef',componentRef,componentRef['formBuilder'])
			console.log('_web_service',_web_service,_web_service['formBuilder'])

			_post_form = componentRef['formBuilder']['group'](group);

			return _post_form;
		};
		this.onSubmit = function(){
			if (!this.hasResults || _hasError || !_post_form){return false};

			//Should be polymorphic - any form on any page,
			let formData = _post_form;

			//TODO submit new and update

			let params = {
				'formValue': formData['value'],
				'reqFields': _post_fields,
				'sHID': _name,
			};

			console.log(['this.onSubmit',params,formData,formData['value'],_post_fields,_name])


			this.postForm();

			//this.webService.postForm(params);//How to access service helper - do I have access?, Just to be safe include

			formData['reset']();
		};
		this.postForm = function(){
			if (!this.hasResults || _hasError){return false};

			let postData = new FormData();
			for (let r_f of _post_fields){
				postData.append(r_f.fieldnameAPI, _post_form['value'][r_f.fieldnameForm])
			};

			//console.log(['this.postForm',postData,this.url,_get,_web_service,this.paramObj()])
			console.log(['values SH post', postData,_post_form,this.fullPath(),_post_fields,_get,_self])
			_http.post(//Don't think this. is defined as expected - it's the bottleneck
				this.url, postData
			).subscribe(
				response => {
					_get.call(_web_service, this.paramObj())
				}
			);
		};

		this.isInvalid = function(control){
		  //console.log(control)
			return !_post_form['controls'][control] || _post_form['controls'][control]['invalid'] && _post_form['controls'][control]['touched'];
		}
		this.isUntouched = function(){
			let untouched = false;
			for (let p_f of _post_fields){
				if (_post_form['controls'] && p_f['hasValidation']){
					untouched = untouched || _post_form['controls'][p_f.fieldnameForm]['pristine']
				}
			}
			return untouched;
		} //return this.rForm.controls.name.pristine || this.rForm.controls.review.pristine;
		this.isIncomplete = function(){
			let incomplete = false;
			for (let p_f of _post_fields){
				if (p_f['hasValidation']){
					incomplete = incomplete || this.isInvalid(p_f.fieldnameForm);
				}
			}
			incomplete = incomplete || this.isUntouched();
			return incomplete;
		}
		this.delete = function(url){
      _http.delete(url).subscribe((res)=>{
        location.reload()
        //this.webService.getSHFromURL(url, function(helper_){console.log(helper_)})
      })
		}
	};

	deleteByURL(url){
	  console.log(['deleteByURL(url){',url,this.http])
	  this.http.delete(url).subscribe((res)=>{
	    location.reload()
	    //this.getSHFromURL(url, function(helper_){console.log(helper_)})
	  })
	}

	getSHFromURL(individualURL, callbackFun){
	  //identify _id
	  console.log(individualURL)
	  var removeRoot = individualURL.replace(this.rootURL,'')
	  removeRoot = removeRoot.replace(this.root,'')
	  console.log(removeRoot)
	  var removeParams = removeRoot.split('?')[0];
	  console.log(removeParams)
	  var path = removeRoot.split('/')
	  if (path[0] == ''){path.shift()}
	  console.log(path)

	  var serviceHelperID;
	  if ((path.length % 2) == 1){
	    //last is the long name
	    serviceHelperID = path[path.length-1].substring(0,1)
	    console.log(serviceHelperID)
	  } else {
	    //last is the id
	    serviceHelperID = path[path.length-2].substring(0,1)+'_id'
	    console.log(serviceHelperID)
	  }

	  var helper =  this.serviceStrut[serviceHelperID];

	  helper.setPath(path);

		return [helper, this.http.get(this.root + removeRoot).subscribe(
			response => {
				console.log(['getServiceHelperFromPath response',this.root + removeRoot,path,helper,serviceHelperID,response])
				helper.setResponce(response).next();
				callbackFun.call(helper, helper)
			},
			error => {
				helper.setError(error);
			}
		)]
	}



	getCodes(params){
		let page = params['page'];
		this['c'] = this.serviceStrut['c'];
		let helper = this['c'];

		if (params.snapshot){
			helper.setPath(["codes", params['snapshot']['url'][1]['path']]);
		}

		//let sessionPageName = params.sessionPageName;

		console.log(helper.fullPath() + '?pn=' + page)
		return this.http.get(
			helper['fullPath']()
			+ '?pn=' + page
		).subscribe(
			response => {
				//console.log(['getBusinesses response',response])
				helper.setResponce(response).next();
				//helper.nextNav();
			},
			error => {
				//console.log(error);
				helper.setError(error);
			}//,() => {onCompleted callback}
		);
	}

	getBusinesses(params){
		let page = params['page'];
		this['b'] = this.serviceStrut['b'];
		let helper = this['b'];
		helper.setPath(["businesses"]);

		//let sessionPageName = params.sessionPageName;

		return this.http.get(
			helper['fullPath']()
			+ '?pn=' + page
		).subscribe(
			response => {
				//console.log(['getBusinesses response',response])
				helper.setResponce(response).next();
				//helper.nextNav();
			},
			error => {
				//console.log(error);
				helper.setError(error);
			}//,() => {onCompleted callback}
		);
	}
	getBusiness(params){//C3,10
		console.log(['getBusiness(params)',params])

		let b_id = params.b_id;
		this['b_id'] = this.serviceStrut['b_id'];
		let helper = this['b_id'];
		helper.setPath(["businesses",b_id]);

		console.log(['return this.http.get', this.http.get(helper.fullPath())])

		return this.http.get(
			helper['fullPath']()
		).subscribe(
			response => {
				console.log(['getBusiness response',response])
				helper.setResponce(response).next();
			},
			error => {
				//console.log(error);
				helper.setError(error);
			}//,() => {onCompleted callback}
		);
	}
	getReviews(params){
		console.log(['getReviews(params)',params])
		let page = params['page'];
		//let b_id = params.b_id;
		let sessionPageName = params['sessionPageName'];

		if (params['self']){
			this['r'] = params['self'];
		} else {
			this['r'] = this.serviceStrut['r'];
		}
		let helper = this['r'];

		helper.setPath(this['b_id'].path().concat(["reviews"]));

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
				//console.log(error);
				helper.setError(error);
			}//,() => {onCompleted callback}
		);
	}
	getInspections(params){
		console.log(['getInspections(params)',params])
		let snapshot = params['snapshot'];
		let page = params['page'];

		if (params['self']){
			this['i'] = params['self'];
		} else {
			this['i'] = this.serviceStrut['i'];
		}
		let helper = this['i'];

		let pathSnapshot = [];
		for (let url of snapshot['url']){
			pathSnapshot.push(url['path']);
		}



		helper.setPath(pathSnapshot);

		console.log(pathSnapshot)

		return this.http.get(
			helper.fullPath()
			+ '?pn=' + page
		).subscribe(
			response => {
				console.log(['getInspections response',response])
				helper.setResponce(response).next();
			},
			error => {
				helper.setError(error);
			}
		);
	}
	getInspection(params){
		let snapshot = params['snapshot'];
		let page = params['page'];
		let i_id = params['i_id'];
		if (params['self']){
			this['i_id'] = params['self'];
		} else {
			this['i_id'] = this.serviceStrut['i_id'];
		}
		let helper = this['i_id'];

		let pathSnapshot = [];
		for (let url of snapshot['url']){
			pathSnapshot.push(url['path']);
		}
		console.log(pathSnapshot)

		helper.setPath(pathSnapshot); //An ID should be passed

		return this.http.get(
			helper.fullPath()
			+ '?pn=' + page
		).subscribe(
			response => {
				console.log(['getInspections response',response])
				helper.setResponce(response).next();
			},
			error => {
				helper.setError(error);
			}
		);

	}
	getViolations(params){
		console.log(['getViolations(params)',params])
		let page = params['page'];

		if (params['self']){
			this['v'] = params['self'];
		} else {
			this['v'] = this.serviceStrut['v'];
		}
		let helper = this['v'];

		helper.setPath(this['i_id'].path().concat(["violations"]));

		return this.http.get(
			helper.fullPath()
			+ '?pn=' + page
		).subscribe(
			response => {
				console.log(['getViolations response',response])
				helper.setResponce(response).next();
			},
			error => {
				helper.setError(error);
			}
		);
	}
	getReview(){}
	getViolation(){}


	vote(votingURL){
		this.http.get(votingURL).subscribe(response => {
				this.getReviews(this['r'].paramObj());
		});
	}

	private _private_codes;
	private _subject_codes = new Subject();
	list_codes = this._subject_codes.asObservable();
	getZipcodes(){
	  return this.http.get('http://localhost:5000/api/v1.0/codes').subscribe(response => {this._subject_codes.next(response['results'])})
  }


}
