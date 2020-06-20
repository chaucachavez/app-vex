import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResumenesComponent } from './resumenes.component';
import { ResumenesFormComponent } from './resumenes-form/resumenes-form.component';

const routes: Routes = [
  {
    path: '',
    component: ResumenesComponent
  }
];

@NgModule({
  declarations: [ResumenesComponent, ResumenesFormComponent],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class ResumenesModule { }
