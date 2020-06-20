import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguracionComponent } from './configuracion.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { IconModule } from '@visurel/iconify-angular';

const routes: Routes = [
  {
    path: '**',
    component: ConfiguracionComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PipesModule,
    MateriaUdemyModule,
    IconModule
  ],
  declarations: [
    ConfiguracionComponent
  ]
})
export class ConfiguracionModule { }
