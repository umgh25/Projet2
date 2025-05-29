import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
})
export class HomeComponent implements OnInit {
  public olympics$: Observable<OlympicCountry[] | null> = this.olympicService.getOlympics();

  constructor(private olympicService: OlympicService) { }

  ngOnInit(): void {
    this.olympics$.subscribe({
      next: (data) => {
      
      },
      error: (err) => {
        console.error('Error receiving data: ', err);
      }
    });

  }
}
