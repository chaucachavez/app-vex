import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { SharedModule } from 'src/app/components/shared.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';

@NgModule({
  declarations: [RegisterComponent],
  imports: [
    CommonModule,
    RegisterRoutingModule,
    SharedModule,
    MateriaUdemyModule
  ]
})
export class RegisterModule {
}
