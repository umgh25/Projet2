import { Component } from '@angular/core';

@Component({
    selector: 'app-header',
    imports: [],
    template: `
  <div class="containtTittle">
   <h2 class="title">Olympic Games App</h2>
   </div>
  `,
    styles: `
  .containtTittle{
    width: 100%;

  .title{
    background: rgb(109, 109, 255);
    width: 100%;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
}
}
  `
})
export class HeaderComponent {

}
