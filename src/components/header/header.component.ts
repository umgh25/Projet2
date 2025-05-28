import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  template: `
   <h2 class="title">Olympic games app</h2>
  `,
  styles: `
  .title{
    background: rgb(109, 109, 255);
    width: 100%;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
}
  `
})
export class HeaderComponent {

}