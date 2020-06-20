import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { SharedModule } from 'src/app/components/shared.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    MateriaUdemyModule,
    SharedModule
  ],
})
export class LoginModule {
}
