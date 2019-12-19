import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AuthService } from './auth.service'; //c5 7

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WebService } from './web.service';//To reg with main module for service: importing part
import { HttpClientModule } from '@angular/common/http';//To reg with main module for service: importing part
import { RouterModule } from '@angular/router';//C2,13
import { ReactiveFormsModule, FormsModule } from '@angular/forms';//c4 6

import { NavComponent } from './nav.component';
import { HomeComponent } from './home.component';//C2,14
import { BusinessesComponent } from './businesses.component';//To import custom ts stuff
import { BusinessComponent } from './business.component';//C2,18
import { InspectionsComponent } from './inspections.component';//C2,18
import { InspectionComponent } from './inspection.component';//C2,18
import { CodesComponent } from './codes.component';//C2,18


var routes = [
	{
		path:'',
		component: HomeComponent
	},
	{
		path: 'businesses',
		component: BusinessesComponent
	},
	{
		path: 'businesses/:b_id',
		component: BusinessComponent
	},
	{
		path: 'businesses/:b_id/inspections',
		component: InspectionsComponent
	},
	{
		path: 'businesses/:b_id/inspections/:i_id',
		component: InspectionComponent
	},
	{
		path: 'codes/:c_id',
		component: CodesComponent
	},
];

@NgModule({
  declarations: [
    AppComponent,
    BusinessesComponent,//To import custom ts stuff
    HomeComponent,//C2,14
    BusinessComponent, //C2,18
    NavComponent,
	//As there is no reviews components, assuming the last subdoc doesnt need component
    InspectionsComponent,
	InspectionComponent,
	CodesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, //include the HttpClientModule in the imports list
    RouterModule.forRoot(routes),//C2,13
    ReactiveFormsModule, //c4 6
	FormsModule,
	
  ],
  providers: [
    WebService,
    AuthService
  ],//specify that the WebService is a Service by including it in the list of providers
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
