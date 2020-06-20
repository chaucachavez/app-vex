import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuiaRemisionComponent } from './guia-remision.component';
import { GuiaRemisionFormComponent } from './guia-remision-form/guia-remision-form.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';

const routes: Routes = [
  {
    path: '',
    component: GuiaRemisionComponent
  },
  {
    path: 'nuevo',
    component: GuiaRemisionFormComponent
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
    GuiaRemisionComponent,
    GuiaRemisionFormComponent
  ],
  entryComponents: [
  ]
})
export class GuiaRemisionModule { }
