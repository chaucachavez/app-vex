import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModalesFormModule } from '../../../../app/components/modales-form.module';
import { MateriaUdemyModule } from '../../../../app/materia-udemy/materia-udemy.module';
import { PipesModule } from '../../../../app/pipes/pipes.module';
import { CotizacionFormComponent } from './cotizacion-form/cotizacion-form.component';
import { CotizacionComponent } from './cotizacion.component';

const routes: Routes = [
  {
    path: '',
    component: CotizacionComponent
  },
  {
    path: 'nuevo',
    component: CotizacionFormComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PipesModule,
    MateriaUdemyModule,
    ModalesFormModule
  ],
  declarations: [
    CotizacionComponent,
    CotizacionFormComponent
  ],
  entryComponents: [
  ]
})
export class CotizacionModule { }
