import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { BaseChartDirective } from 'ng2-charts';

import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineController,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

@Component({
    selector: 'app-line-graph',
    imports: [CommonModule, BaseChartDirective],
    template: `
   <div class="chart-container" *ngIf="lineChartData?.datasets?.length">
  <canvas baseChart
    [data]="lineChartData"
    [options]="lineChartOptions"
    [type]="lineChartType">
  </canvas>
</div>
  `,
    styleUrl: './country-trends.component.scss'
})
export class CountryPerformanceChartComponent implements OnChanges {
  @Input() countryData?: OlympicCountry;
  // Initialisation des données du graphique en ligne (labels et datasets vides)
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };
  // Configuration des options du graphique
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        }
      },
      y: {
        beginAtZero: true,
      }
    }
  };

  lineChartType: 'line' = 'line';

  
  // Méthode déclenchée automatiquement à chaque changement d'input (countryData)
  ngOnChanges(changes: SimpleChanges): void {
    if (this.countryData) {
      // Extraction des années comme labels (convertis en chaîne)
      const labels = this.countryData.participations.map(p => p.year.toString());

      // Extraction des données pour chaque métrique : médailles, athlètes, ratio
      const medals = this.countryData.participations.map(p => p.medalsCount);
      const athletes = this.countryData.participations.map(p => p.athleteCount);
      // Calcul du ratio Médailles / Athlètes pour chaque participation, arrondi à 2 décimales
      const ratio = this.countryData.participations.map(p => 
        p.athleteCount ? +(p.medalsCount / p.athleteCount).toFixed(2) : 0
      );

      // Mise à jour des données du graphique avec les labels et datasets
      this.lineChartData = {
        labels,
        datasets: [
          {
            label: 'Médailles',
            data: medals,
            borderColor: '#742774',
            fill: false
          },
          {
            label: 'Athlètes',
            data: athletes,
            borderColor: '#1f77b4',
            fill: false
          },
          {
            label: 'Ratio Médailles / Athlètes',
            data: ratio,
            borderColor: '#2ca02c',
            fill: false
          }
        ]
      };
    }
  }
}