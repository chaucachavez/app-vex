import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComprasComponent } from './compras.component';
import { ComprasFormComponent } from './compras-form/compras-form.component';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: ComprasComponent
  },
  {
    path: 'nuevo',
    component: ComprasFormComponent
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
    ComprasComponent,
    ComprasFormComponent
  ],
  entryComponents: [
  ]
})
export class ComprasModule { }
