import { Component, Input } from '@angular/core';
import { OlympicCountry } from 'src/app/core/models/Olympic';

@Component({
  selector: 'app-name-country', // Sélecteur utilisé pour insérer ce composant dans un autre template
  imports: [], // Pas d'importation de modules spécifiques ici
  template: `
    <section>
      <!-- Affichage du nom du pays -->
      <div class="tittle">{{ this.countryData.country }}</div>

      <!-- Statistiques du pays -->
      <div class="numbers">
        <span>
          <p>Number of entries</p>
          <strong>{{ countryData.participations.length }}</strong> <!-- Nombre de participations -->
        </span>
        <span>
          <p>Total number medals</p>
          <strong>{{ getTotalMedals() }}</strong> <!-- Total des médailles -->
        </span>
        <span>
          <p>Total number atheletes</p>
          <strong>{{ getTotalAthletes() }}</strong> <!-- Total des athlètes -->
        </span>
      </div>
    </section>
  `,
  styleUrl: './country-name.component.scss', // Feuille de style liée au composant
})
export class CountryStatsComponent {
  // Propriété reçue en entrée : contient les données du pays sélectionné
  @Input() countryData!: OlympicCountry;

  // Calcule le total des médailles obtenues par le pays
  getTotalMedals(): number {
    return this.countryData.participations.reduce(
      (sum, p) => sum + p.medalsCount,
      0
    );
  }

  // Calcule le nombre total d'athlètes ayant participé pour ce pays
  getTotalAthletes(): number {
    return this.countryData.participations.reduce(
      (sum, p) => sum + p.athleteCount,
      0
    );
  }
}