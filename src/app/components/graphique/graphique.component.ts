import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-graphique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pie-chart-container">
  <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" class="responsive-svg">
    <g transform="translate(200, 200)">
      <!-- Cercle de fond -->
      <circle cx="0" cy="0" r="120" fill="#f5f5f5"></circle>

      <!-- Segments -->
      <path
        *ngFor="let country of chartData; let i = index"
        [attr.d]="getSegmentPath(i)"
        [attr.fill]="country.color"
        class="pie-segment"
        (mousemove)="onMouseMove($event, i)"
        (mouseleave)="hoveredIndex = -1"
        (click)="onSegmentClick(country.country)"
        [class.highlighted]="hoveredIndex === i"
      ></path>

      <!-- Tooltip -->
      <g
        *ngIf="hoveredIndex >= 0"
        class="tooltip"
        [attr.transform]="'translate(' + tooltipX + ',' + tooltipY + ')'">
        <rect
          x="-60"
          y="-35"
          rx="8"
          ry="8"
          width="120"
          height="60"
          fill="#00858B"
          stroke="#ccc"
        ></rect>
        <text
          x="0"
          y="-10"
          text-anchor="middle"
          fill="white"
          font-size="14">
          {{ chartData[hoveredIndex].country }}
        </text>
        <text
          x="0"
          y="10"
          text-anchor="middle"
          fill="white"
          font-size="14">
          🏅 {{ chartData[hoveredIndex].totalMedals }}
        </text>
      </g>

      <!-- Lignes + labels -->
      <g *ngFor="let country of chartData; let i = index">
        <line
          [attr.x1]="getLabelLine(i).x1"
          [attr.y1]="getLabelLine(i).y1"
          [attr.x2]="getLabelLine(i).x2"
          [attr.y2]="getLabelLine(i).y2"
          [attr.stroke]="country.color"
          stroke-width="1.5"
        ></line>
        <text
          [attr.x]="getLabelLine(i).x2 + (getLabelLine(i).textAnchor === 'start' ? 5 : -5)"
          [attr.y]="getLabelLine(i).y2 + 5"
          [attr.text-anchor]="getLabelLine(i).textAnchor"
          font-size="12"
          fill="#333">
          {{ country.country }}
        </text>
      </g>
    </g>
  </svg>
</div>
  `,
  styleUrl: './graphique.component.scss',
})
export class GraphiqueComponent {
  // Calcule les coordonnées pour les lignes et labels
  getLabelLine(index: number) {

    // Calcul des angles de début et fin pour le segment
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (this.chartData[i].totalMedals / this.totalMedals) * 360;
    }
    const endAngle =
      startAngle + (this.chartData[index].totalMedals / this.totalMedals) * 360;
    const midAngle = (startAngle + endAngle) / 2;

    // Points de départ (bord du pie) et d'arrivée (position du texte)
    const lineStart = this.polarToCartesian(0, 0, 120, midAngle); // bord du pie
    const lineEnd = this.polarToCartesian(0, 0, 150, midAngle); // éloigné pour texte

    // Détermine l'alignement du texte selon la position
    const textAnchor = midAngle > 90 && midAngle < 270 ? 'end' : 'start';

    return {
      x1: lineStart.x,
      y1: lineStart.y,
      x2: lineEnd.x,
      y2: lineEnd.y,
      textAnchor,
    };
  }
  // Gère le mouvement de la souris pour l'infobulle
  onMouseMove(event: MouseEvent, index: number): void {
    this.hoveredIndex = index;

    // Conversion des coordonnées de la souris en coordonnées SVG
    const svg = (event.target as SVGPathElement).ownerSVGElement;
    const pt = svg!.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    // Convertit les coordonnées de la fenêtre en coordonnées SVG
    const cursorpt = pt.matrixTransform(svg!.getScreenCTM()!.inverse());
    this.tooltipX = cursorpt.x - 230;
    this.tooltipY = cursorpt.y - 230; // un petit décalage vers le haut
  }

  // Données du graphique
  chartData: {
    country: string;
    totalMedals: number;
    color: string;
    percentage: number;
  }[] = [];
  totalMedals = 0;
  hoveredIndex = -1;
  colorScheme = ['#8C3F4D', '#9D5D5D', '#AEC4E8', '#C2E3F5', '#9986A5'];
  tooltipX = 0;
  tooltipY = 0;

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

          // Préparation des données pour le graphique
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
            .sort((a, b) => b.totalMedals - a.totalMedals);

          // Calcul des pourcentages
          this.chartData = this.chartData.map((item) => {
            const percentage = (item.totalMedals / this.totalMedals) * 100;
            item.percentage = percentage;
            return item;
          });
        }
      },
      error: (err) => console.error('Error loading data:', err),
    });
  }

  // Génère le path SVG pour un segment du camembert
  getSegmentPath(index: number): string {
    if (!this.chartData.length) return '';

    // Calcul de l'angle de départ
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (this.chartData[i].totalMedals / this.totalMedals) * 360;
    }

    // Calcul de l'angle de fin
    const endAngle =
      startAngle + (this.chartData[index].totalMedals / this.totalMedals) * 360;

    // Génération du path SVG
    return this.describeArc(0, 0, 120, startAngle, endAngle);
  }

  // Génère la description d'un arc SVG
  private describeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M',
      x,
      y,
      'L',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      'Z',
    ].join(' ');
  }
  // Convertit des coordonnées polaires en cartésiennes
  private polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }
  onSegmentClick(countryName: string): void {
    this.router.navigate(['/details', countryName]);
  }
}
