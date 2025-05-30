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

// Plugin personnalisé pour dessiner des labels externes au graphique
const externalLabelsPlugin = {
  id: 'externalLabels',

  // Fonction exécutée après le dessin du dataset
  afterDatasetDraw(chart: any) {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return; // Vérifie que la zone du graphique est bien définie

    const meta = chart.getDatasetMeta(0); // Métadonnées du premier dataset
    const isMobile = window.innerWidth < 468; // Détecte si on est sur mobile

    if (isMobile) {
      // Version mobile : labels centrés dans chaque segment
      meta.data.forEach((arc: any, index: number) => {
        const angle = (arc.startAngle + arc.endAngle) / 2; // angle central du segment
        const label = data.labels?.[index];
        const value = data.datasets[0].data[index];

        // Rayon pour placer le texte bien au milieu du segment
        const radius = (arc.innerRadius + arc.outerRadius) / 2;

        // Position x et y du texte
        const x = arc.x + Math.cos(angle) * radius;
        const y = arc.y + Math.sin(angle) * radius;

        // Style du texte avec taille dynamique selon la valeur
        ctx.font = `bold ${this.getFontSize(value)}px Arial`;
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#fff'; // Contour blanc pour visibilité
        ctx.lineWidth = 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Dessin du texte avec contour
        ctx.strokeText(label, x, y);
        ctx.fillText(label, x, y);
      });
    } else {
      // Version desktop : labels à l'extérieur avec ligne de liaison
      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;
      const outerRadius = meta.data[0]?.outerRadius ?? 0;

      meta.data.forEach((arc: any, index: number) => {
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const label = data.labels?.[index];

        // Calcul des points pour la ligne de connexion du label
        const x1 = centerX + outerRadius * Math.cos(angle);
        const y1 = centerY + outerRadius * Math.sin(angle);
        const x2 = centerX + (outerRadius + 40) * Math.cos(angle);
        const y2 = centerY + (outerRadius + 20) * Math.sin(angle);
        const x3 = x2 + (Math.cos(angle) * 25);

        // Dessin de la ligne entre le segment et le label
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y2);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Texte du label avec alignement selon côté gauche/droit
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = angle > Math.PI ? 'right' : 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x3 + (angle > Math.PI ? -5 : 5), y2);
      });
    }
  },

  // Calcule la taille de police en fonction de la valeur du segment
  getFontSize(value: number): number {
    const baseSize = 8;
    const scaleFactor = Math.min(value / 1000, 1); // max scale à 1
    return baseSize + Math.floor(scaleFactor * 4); // taille entre 8 et 12 px
  },
};

// Enregistrement des plugins nécessaires pour Chart.js
Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  annotationPlugin,
  externalLabelsPlugin, // notre plugin personnalisé
  ChartDataLabels
);

@Component({
  selector: 'app-graphique',
  standalone: true,
  imports: [CommonModule, BaseChartDirective], // Import du module commun et directive graphique
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
  styleUrl: './country-medals-graph.component.scss',
})
export class MedalsPieChartComponent {
  // Données transformées pour le graphique
  chartData: {
    country: string;
    totalMedals: number;
    color: string;
    percentage: number;
  }[] = [];

  totalMedals = 0; // Total des médailles de tous les pays
  colorScheme = ['#8C3F4D', '#9D5D5D', '#AEC4E8', '#C2E3F5', '#9986A5']; // Palette de couleurs

  public pieChartType: ChartType = 'pie'; // Type de graphique : camembert

  // Configuration initiale des données pour ng2-charts
  public pieChartData: ChartConfiguration['data'] = {
    labels: [], // noms des pays
    datasets: [{ data: [], backgroundColor: [], hoverBackgroundColor: [] }],
  };

  // Options de configuration du graphique
  public pieChartOptions: ChartConfiguration['options'] = {
    maintainAspectRatio: false, // ne pas forcer le ratio fixe
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
        display: false, // pas de légende automatique
      },
      datalabels: {
        display: false, // labels internes désactivés, on utilise le plugin personnalisé
      },
      tooltip: {
        enabled: true,
        callbacks: {
          // Format personnalisé pour les tooltips (affiche une médaille et la valeur)
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
        displayColors: false, // pas de carré de couleur dans tooltip
      },
    },

    // Gestion du clic sur un segment du camembert
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        this.onSegmentClick(this.chartData[index].country);
      }
    },
  };

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    // Récupération des données via le service OlympicService
    this.olympicService.getOlympics().subscribe({
      next: (data) => {
        if (data) {
          // Calcul du total général des médailles pour tous les pays
          this.totalMedals = data.reduce(
            (sum, country) =>
              sum +
              country.participations.reduce((s, p) => s + p.medalsCount, 0),
            0
          );

          // Préparation des données pour le graphique
          this.chartData = data
            .map((country, index) => ({
              country: country.country,
              totalMedals: country.participations.reduce(
                (sum, p) => sum + p.medalsCount,
                0
              ),
              color: this.colorScheme[index % this.colorScheme.length],
              percentage: 0, // non utilisé ici mais prêt pour un usage futur
            }))
            .sort((a, b) => b.totalMedals - a.totalMedals); // Tri décroissant selon total médailles

          this.updateChartData(); // Mise à jour des données du graphique
        }
      },
      error: (err) => console.error('Error loading data:', err),
    });
  }

  // Met à jour la structure des données pour Chart.js (labels, data, couleurs)
  private updateChartData(): void {
    this.pieChartData = {
      labels: this.chartData.map((d) => d.country),
      datasets: [
        {
          data: this.chartData.map((d) => d.totalMedals),
          backgroundColor: this.chartData.map((d) => d.color),
          hoverBackgroundColor: this.chartData.map((d) =>
            this.adjustBrightness(d.color, -20) // Couleur légèrement plus sombre au survol
          ),
          borderWidth: 0,
        },
      ],
    };
  }

  // Ajuste la luminosité d'une couleur hex (positive ou négative)
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

  // Méthodes pour gérer les événements hover et click (actuellement vides)
  chartHovered(event: any): void {}
  chartClicked(event: any): void {}

  // Action au clic sur un segment : navigation vers une page détail du pays
  onSegmentClick(countryName: string): void {
    this.router.navigate(['/details', countryName]);
  }
}
