import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { OlympicCountry } from '../models/Olympic';

@Injectable({
  providedIn: 'root',
})
export class OlympicService {
  private olympicUrl = './assets/mock/olympic.json';
  private olympics$ = new BehaviorSubject<OlympicCountry[] | null>(null);

  constructor(private http: HttpClient) {}

  loadInitialData() {
    return this.http.get<OlympicCountry[]>(this.olympicUrl).pipe(
      take(1),
      tap((value) => this.olympics$.next(value)),
      catchError((error, caught) => {
        console.error('Error loading Olympic data:', error);
        console.error(error);
        this.olympics$.next(null);
        return throwError(() => new Error('Failed to load Olympic data'));
      })
    );
  }

  getOlympics() {
    return this.olympics$.asObservable();
  }
}