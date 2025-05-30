import { Component } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
    selector: 'app-medals-country', // Sélecteur du composant utilisé dans les templates HTML
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
    styleUrls: ['./country-medals.component.scss'] // Fichier de styles associé
})
export class OlympicStatsComponent  {
  // Observable récupérant les données des JO via le service
  public olympics$: Observable<OlympicCountry[] | null> =
    this.olympicService.getOlympics();

  // Propriétés pour stocker les résultats à afficher dans le template
  public totalJOs: number = 0;          // Nombre total d'éditions des JO
  public totalCountries: number = 0;    // Nombre total de pays participants

  // Injection du service OlympicService via le constructeur
  constructor(private olympicService: OlympicService) {}

  // Hook de cycle de vie appelé après l'initialisation du composant
  ngOnInit(): void {
    this.olympics$
      .pipe(
        map((olympics) => {
          // Si aucune donnée, on retourne des compteurs à zéro
          if (!olympics) return { joCount: 0, countryCount: 0 };

          // Extraction de toutes les années de participation depuis chaque pays
          const allYears = olympics.flatMap((country) =>
            country.participations.map((participation) => participation.year)
          );

          // Utilisation d'un Set pour obtenir les années uniques (évite les doublons)
          const uniqueJOs = new Set(allYears).size;

          // Retourne le nombre de JO uniques et le nombre de pays
          return {
            joCount: uniqueJOs,
            countryCount: olympics.length,
          };
        })
      )
      .subscribe({
        // Mise à jour des propriétés avec les valeurs calculées
        next: ({ joCount, countryCount }) => {
          this.totalJOs = joCount;
          this.totalCountries = countryCount;
        },
        // Gestion des erreurs (par exemple, en cas de problème avec la requête HTTP)
        error: (err) => {
          console.error('Error calculating stats:', err);
          this.totalJOs = 0;
          this.totalCountries = 0;
        },
      });
  }
}
