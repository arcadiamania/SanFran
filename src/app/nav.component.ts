import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { ActivatedRoute } from '@angular/router';//C2,20
import { WebService } from './web.service';//C2,5


@Component({
 selector: 'navigation',
 templateUrl: './nav.component.html',
 styleUrls: ['./bootstrap.min.css'],
})

export class NavComponent {
	constructor(
		private authService: AuthService,
		private route: ActivatedRoute,
		private webService: WebService,
	) {}
}
