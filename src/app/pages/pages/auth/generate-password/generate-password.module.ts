import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneratePasswordRoutingModule } from './generate-password-routing.module';
import { GeneratePasswordComponent } from './generate-password.component';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  declarations: [GeneratePasswordComponent],
  imports: [
    CommonModule,
    GeneratePasswordRoutingModule,
    MateriaUdemyModule,
    SharedModule
  ],
})
export class GeneratePasswordModule {
}

