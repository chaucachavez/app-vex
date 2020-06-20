import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneratePasswordComponent } from './generate-password.component';


const routes: Routes = [
  {
    path: '',
    component: GeneratePasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneratePasswordRoutingModule {
}
