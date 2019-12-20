//C2,12
import { Component } from '@angular/core';
import { AuthService } from './auth.service';//c5 8

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./bootstrap.min.css'],
})
export class HomeComponent {
	constructor(private authService: AuthService) {}//c5 8
}
