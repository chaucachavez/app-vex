import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PipesModule } from '../../../pipes/pipes.module';
import { MateriaUdemyModule } from '../../../materia-udemy/materia-udemy.module';
import { SharedModule } from '../../../components/shared.module';
import { InicioComponent } from './inicio.component';

const routes: Routes = [
  {
    path: '**',
    component: InicioComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PipesModule,
    MateriaUdemyModule,
    SharedModule
  ],
  declarations: [InicioComponent]
})
export class InicioModule { }
