import { Component, Input } from '@angular/core';
import { OlympicCountry } from 'src/app/core/models/Olympic';

@Component({
  selector: 'app-name-country',
  imports: [],
  template: `
    <section>
      <div class="tittle">{{this.countryData.country}}</div>
      <div class="numbers">
        <span>
          <p>Number of entries</p>
          <strong>{{ countryData.participations.length }}</strong>
        </span>
        <span>
          <p>Total number medals</p>
          <strong>{{ getTotalMedals() }}</strong>
        </span>
        <span>
          <p>Total number atheletes</p>
          <strong>{{ getTotalAthletes() }}</strong>
        </span>
      </div>
    </section>
  `,
  styleUrl: './country-name.component.scss',
})
export class NameCountryComponent {
  @Input() countryData!: OlympicCountry;

  getTotalMedals(): number {
    return this.countryData.participations.reduce(
      (sum, p) => sum + p.medalsCount,
      0
    );
  }

  getTotalAthletes(): number {
    return this.countryData.participations.reduce(
      (sum, p) => sum + p.athleteCount,
      0
    );
  }
}
