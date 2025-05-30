import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { HeaderComponent } from './components/header/header.component';
import { OlympicStatsComponent  } from './components/country-medals/country-medals.component';
import { MedalsPieChartComponent  } from './components/country-medals-graph/country-medals-graph.component';
import { CountryStatsComponent } from './components/country-name/country-name.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, NotFoundComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HeaderComponent,
    OlympicStatsComponent ,
    MedalsPieChartComponent ,
    CountryStatsComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
