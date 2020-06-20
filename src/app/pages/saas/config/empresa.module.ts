import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpresaComponent } from './empresa.component';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SharedModule } from 'src/app/components/shared.module';

const routes: Routes = [
  {
    path: '**',
    component: EmpresaComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PipesModule,
    MateriaUdemyModule,
    SharedModule
  ],
  declarations: [EmpresaComponent]
})
export class EmpresaModule { }
