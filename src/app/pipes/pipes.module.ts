import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltroBusquedaPipe } from './filtro-busqueda.pipe';



@NgModule({
  declarations: [FiltroBusquedaPipe],
  //exportamos para que se pueda usar desde Home
  exports: [
    FiltroBusquedaPipe
  ]
})
export class PipesModule { }
