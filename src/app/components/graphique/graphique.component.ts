import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Plugin personnalisé pour labels externes
const externalLabelsPlugin = {
  id: 'externalLabels',
  afterDatasetDraw(chart: any, args: any, options: any) {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return;

    const meta = chart.getDatasetMeta(0);
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const outerRadius = meta.data[0]?.outerRadius ?? 0;
    const isMobile = window.innerWidth < 568;

    // Paramètres ajustables
    const minLabelDistance = isMobile ? 18 : 50; // Distance minimale absolue
    const labelPadding = isMobile ? -8 : 20; // Espace supplémentaire
    const lineExtension = isMobile ? 10 : 25; // Longueur de l'extension horizontale

    meta.data.forEach((arc: any, index: number) => {
      const angle = (arc.startAngle + arc.endAngle) / 2;
      const label = data.labels?.[index];

      // 1. Calcul des positions avec distance dynamique
      const dynamicDistance = Math.max(outerRadius * 0.3, minLabelDistance);
      const x1 = centerX + outerRadius * Math.cos(angle);
      const y1 = centerY + outerRadius * Math.sin(angle);
      const x2 = centerX + (outerRadius + dynamicDistance) * Math.cos(angle);
      const y2 =
        centerY + (outerRadius + dynamicDistance * 0.4) * Math.sin(angle);
      const x3 = x2 + Math.cos(angle) * lineExtension; // Extension finale

      // 2. Dessin de la ligne de connexion (3 segments)
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y2);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = isMobile ? 1 : 1.5;
      ctx.stroke();

      // 3. Configuration du texte
      const textConfig = {
        x: x3 + (angle > Math.PI ? -labelPadding : labelPadding),
        y: y2,
        align: angle > Math.PI ? 'right' : ('left' as CanvasTextAlign),
        font: isMobile ? 'bold 10px Arial' : 'bold 12px Arial',
      };

      ctx.font = textConfig.font;
      ctx.fillStyle = '#333';
      ctx.textAlign = textConfig.align;
      ctx.textBaseline = 'middle';

      // 4. Gestion des labels longs (mobile)
      if (isMobile && label.length > 10) {
        const shortened = this.shortenLabel(label);
        ctx.fillText(shortened, textConfig.x, textConfig.y);
      } else {
        ctx.fillText(label, textConfig.x, textConfig.y);
      }
    });
  },

  shortenLabel(label: string): string {
    // Abrège les longs noms de pays
    const abbreviations: Record<string, string> = {
      'United States': 'USA',
    };

    return (
      abbreviations[label] ||
      (label.length > 10 ? label.substring(0, 8) + '..' : label)
    );
  },
};


// Enregistrement des plugins
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  annotationPlugin,
  externalLabelsPlugin,
  ChartDataLabels
);

@Component({
  selector: 'app-graphique',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="pie-chart-container">
      <canvas
        baseChart
        [data]="pieChartData"
        [options]="pieChartOptions"
        [type]="pieChartType"
        (chartHover)="chartHovered($event)"
        (chartClick)="chartClicked($event)"
      >
      </canvas>
    </div>
  `,
  styleUrl: './graphique.component.scss',
})
export class GraphiqueComponent {
  chartData: {
    country: string;
    totalMedals: number;
    color: string;
    percentage: number;
  }[] = [];
  totalMedals = 0;
  colorScheme = ['#8C3F4D', '#9D5D5D', '#AEC4E8', '#C2E3F5', '#9986A5'];

  public pieChartType: ChartType = 'pie';

  // Structure des données pour ng2-charts
  public pieChartData: ChartConfiguration['data'] = {
    labels: [], // Noms des pays 
    datasets: [{ data: [], backgroundColor: [], hoverBackgroundColor: [] }],
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const medalIcon = '🏅';
            return `${medalIcon} ${value}`;
          },
        },
        backgroundColor: '#008C99',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        displayColors: false,
      },

    },

    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        this.onSegmentClick(this.chartData[index].country);
      }
    },
  };

  constructor(private olympicService: OlympicService, private router: Router) { }

  ngOnInit(): void {
    this.olympicService.getOlympics().subscribe({
      next: (data) => {
        if (data) {
          // Calcul du total des médailles
          this.totalMedals = data.reduce(
            (sum, country) =>
              sum +
              country.participations.reduce((s, p) => s + p.medalsCount, 0),
            0
          );

          // Transformation des données pour le graphique
          this.chartData = data
            .map((country, index) => ({
              country: country.country,
              totalMedals: country.participations.reduce(
                (sum, p) => sum + p.medalsCount,
                0
              ),
              color: this.colorScheme[index % this.colorScheme.length],
              percentage: 0,
            }))
            .sort((a, b) => b.totalMedals - a.totalMedals); // Tri décroissant

          this.updateChartData();
        }
      },
      error: (err) => console.error('Error loading data:', err),
    });
  }

  // Met à jour les données du graphique
  private updateChartData(): void {
    this.pieChartData = {
      labels: this.chartData.map((d) => d.country),
      datasets: [
        {
          data: this.chartData.map((d) => d.totalMedals),
          backgroundColor: this.chartData.map((d) => d.color),
          hoverBackgroundColor: this.chartData.map((d) =>
            this.adjustBrightness(d.color, -20)
          ),
          borderWidth: 0,
        },
      ],
    };
  }

  // Fonction utilitaire pour ajuster la luminosité d'une couleur
  private adjustBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  }

  chartHovered(event: any): void { }
  chartClicked(event: any): void { }

  onSegmentClick(countryName: string): void {
    this.router.navigate(['/details', countryName]);
  }
}
