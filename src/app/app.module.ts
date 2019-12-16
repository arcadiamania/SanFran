import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AuthService } from './auth.service'; //c5 7

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BusinessesComponent } from './businesses.component';//To import custom ts stuff
import { WebService } from './web.service';//To reg with main module for service: importing part
import { HttpClientModule } from '@angular/common/http';//To reg with main module for service: importing part
import { RouterModule } from '@angular/router';//C2,13
import { HomeComponent } from './home.component';//C2,14
import { BusinessComponent } from './business.component';//C2,18
import { ReactiveFormsModule } from '@angular/forms';//c4 6
import { NavComponent } from './nav.component';

var routes = [//C2,14
	{
		path:'',
		component: HomeComponent
	},
	{
		path: 'businesses',
		component: BusinessesComponent
	},
	{//C2,18
		path: 'businesses/:id',
		component: BusinessComponent
	}
];

@NgModule({
  declarations: [
    AppComponent,
	BusinessesComponent,//To import custom ts stuff
	HomeComponent,//C2,14 
	BusinessComponent, //C2,18
	NavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
	HttpClientModule, //include the HttpClientModule in the imports list
	RouterModule.forRoot(routes),//C2,13
	ReactiveFormsModule, //c4 6
  ],
  providers: [
	WebService,
	AuthService
  ],//specify that the WebService is a Service by including it in the list of providers
  bootstrap: [AppComponent]
})
export class AppModule { }
