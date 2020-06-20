import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CuentaComponent } from './cuenta.component';
import { SharedModule } from 'src/app/components/shared.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';

const routes: Routes = [
  {
    path: '**',
    component: CuentaComponent
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
  declarations: [CuentaComponent]
})
export class CuentaModule { }
