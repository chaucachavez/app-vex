import { NgModule } from '@angular/core';
import { ImagenPipe } from './imagen.pipe';
import { DomseguroPipe } from './domseguro.pipe';

@NgModule({
  imports: [
  ],
  declarations: [ImagenPipe, DomseguroPipe],
  exports: [ImagenPipe, DomseguroPipe]
})
export class PipesModule { }
