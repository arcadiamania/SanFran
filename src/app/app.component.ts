import { Component } from '@angular/core';
//C2,13 import { BusinessesComponent } from './businesses.component'; //To import custom ts stuff

@Component({
  selector: 'app-root',
  //selector: 'app-title',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SanFran';
}
