import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContingenciasComponent } from './contingencias.component';
import { ContingenciasFormComponent } from './contingencias-form/contingencias-form.component';

const routes: Routes = [
  {
    path: '',
    component: ContingenciasComponent
  }
];

@NgModule({
  declarations: [ContingenciasComponent, ContingenciasFormComponent],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class ContingenciasModule { }
