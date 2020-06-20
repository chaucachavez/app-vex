import { NgModule } from '@angular/core';
import { LoadingComponent } from './shared/loading/loading.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconModule } from '@visurel/iconify-angular';
import { MateriaUdemyModule } from '../materia-udemy/materia-udemy.module';

@NgModule({
  imports: [
    MateriaUdemyModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IconModule
  ],
  declarations: [
    LoadingComponent
  ],
  exports: [
    LoadingComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IconModule
  ]
})
export class SharedModule { }
