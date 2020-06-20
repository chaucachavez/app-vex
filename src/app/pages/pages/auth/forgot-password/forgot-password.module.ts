import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ForgotPasswordRoutingModule } from './forgot-password-routing.module';
import { ForgotPasswordComponent } from './forgot-password.component';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  declarations: [ForgotPasswordComponent],
  imports: [
    CommonModule,
    ForgotPasswordRoutingModule,
    MateriaUdemyModule,
    SharedModule
  ],
})
export class ForgotPasswordModule {
}

