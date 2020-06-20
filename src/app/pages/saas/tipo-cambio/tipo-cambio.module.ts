import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TipoCambioComponent } from './tipo-cambio.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { SharedModule } from 'src/app/components/shared.module';

const routes: Routes = [
  {
    path: '**',
    component: TipoCambioComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PipesModule,
    MateriaUdemyModule,
    ModalesFormModule,
    SharedModule
  ],
  declarations: [TipoCambioComponent]
})
export class TipoCambioModule { }
