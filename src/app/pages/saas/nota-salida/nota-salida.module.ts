import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotaSalidaComponent } from './nota-salida.component';
import { NotaSalidaFormComponent } from './nota-salida-form/nota-salida-form.component';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

const routes: Routes = [
  {
    path: '',
    component: NotaSalidaComponent
  },
  {
    path: 'nuevo',
    component: NotaSalidaFormComponent
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
    NotaSalidaComponent,
    NotaSalidaFormComponent
  ],
  entryComponents: [
  ]
})
export class NotaSalidaModule { }
