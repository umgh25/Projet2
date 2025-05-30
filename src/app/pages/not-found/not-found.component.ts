import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    standalone: false
}) // NotFoundComponent est le composant qui s'affiche lorsque la page demandée n'est pas trouvée
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
