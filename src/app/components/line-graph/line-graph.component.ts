import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
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
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div *ngIf="lineChartData" class="containeGraph">
      <canvas
        baseChart
        [data]="lineChartData"
        [options]="lineChartOptions"
        [type]="'line'"
      >
      </canvas>
    </div>
  `,
  styleUrl: './line-graph.component.scss',
})
export class LineGraphComponent implements OnChanges {
  @Input() countryData!: OlympicCountry;

  lineChartData: ChartConfiguration<'line'>['data'] | null = null;

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    scales: {
      x: { title: { display: true, text: 'Année' } },
      y: { title: { display: true, text: 'Valeur' } },
    },
  };

  ngOnChanges(): void {
    if (this.countryData) {
      const participations = this.countryData.participations;

      this.lineChartData = {
        labels: participations.map(p => p.year.toString()),
        datasets: [
          {
            label: 'Nombre de médailles',
            data: participations.map(p => p.medalsCount),
            borderColor: '#1f77b4',
            fill: false,
            tension: 0.3,
          },
          {
            label: 'Nombre d’athlètes',
            data: participations.map(p => p.athleteCount),
            borderColor: '#ff7f0e',
            fill: false,
            tension: 0.3,
          },
          {
            label: 'Participations',
            data: participations.map(() => 1),
            borderColor: '#2ca02c',
            fill: false,
            tension: 0.3,
          },
        ],
      };
    }
  }
}