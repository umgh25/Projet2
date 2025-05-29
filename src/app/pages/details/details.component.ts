import { Component, OnInit } from '@angular/core';
import { NameCountryComponent } from "../../components/country-name/country-name.component";
import { LineGraphComponent } from "../../components/country-trends/country-trends.component";
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { ActivatedRoute } from '@angular/router';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-details',
    imports: [NameCountryComponent, LineGraphComponent, CommonModule],
    template: `
  <button (click)="back()" class="btn">Back</button>
    <div class="container" *ngIf="countryData">
      <div class="containtInfoCountr">
        <app-name-country [countryData]="countryData"></app-name-country>
      </div>
      <div class="containtGraph">
        <app-line-graph [countryData]="countryData"></app-line-graph>
      </div>
    </div>
    <div *ngIf="!countryData">
      <p>Chargement des données...</p>
    </div>
  `,
    styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  countryData?: OlympicCountry;

  constructor(
    private route: ActivatedRoute,
    private olympicService: OlympicService,
    private router: Router
  ) { }
  back() {
    this.router.navigate(['']);  
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const countryName = params.get('country');
      if (countryName) {
        this.olympicService.getOlympics().subscribe((data) => {
          const countries = data as OlympicCountry[];
          this.countryData = countries.find(
            (c) => c.country.toLowerCase() === countryName.toLowerCase()
          );
          
        });
      }
    });


  }
}