import { Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-medals-country',
  standalone: true,
  imports: [],
  template: `
    <section>
      <div class="tittle">Medals per Country</div>
      <div class="numbers">
        <span>
          <p>Number of JOs</p>
          <strong>{{ totalJOs }}</strong>
        </span>
        <span>
          <p>Number of Countries</p>
          <strong>{{ totalCountries }}</strong>
        </span>
      </div>
    </section>
  `,
  styleUrls: ['./medals-country.component.scss'],
})
export class MedalsCountryComponent {
  public olympics$: Observable<OlympicCountry[] | null> =
    this.olympicService.getOlympics();

  public totalJOs: number = 0;
  public totalCountries: number = 0;

  constructor(private olympicService: OlympicService) {}

  ngOnInit(): void {
    this.olympics$
      .pipe(
        map((olympics) => {
          if (!olympics) return { joCount: 0, countryCount: 0 };

          // Calcul du nombre de JO uniques
          const allYears = olympics.flatMap((country) =>
            country.participations.map((participation) => participation.year)
          );
          const uniqueJOs = new Set(allYears).size;
          return {
            joCount: uniqueJOs,
            countryCount: olympics.length,
          };
        })
      )
      .subscribe({
        next: ({ joCount, countryCount }) => {
          this.totalJOs = joCount;
          this.totalCountries = countryCount;
        },
        error: (err) => {
          console.error('Error calculating stats:', err);
          this.totalJOs = 0;
          this.totalCountries = 0;
        },
      });
  }
}
