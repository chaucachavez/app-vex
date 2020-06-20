import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnulacionesComponent } from './anulaciones.component';
import { AnulacionesFormComponent } from './anulaciones-form/anulaciones-form.component';

const routes: Routes = [
  {
    path: '',
    component: AnulacionesComponent
  }
];

@NgModule({
  declarations: [AnulacionesComponent, AnulacionesFormComponent],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class AnulacionesModule { }
