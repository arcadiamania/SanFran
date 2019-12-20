import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { ActivatedRoute } from '@angular/router';//C2,20

@Component({
 selector: 'navigation',
 templateUrl: './nav.component.html',
 styleUrls: ['./bootstrap.min.css'],
})

export class NavComponent {
	constructor(
		private authService: AuthService,
		private route: ActivatedRoute
	) {}


	setBreadcrumbs(path){

	}
}
