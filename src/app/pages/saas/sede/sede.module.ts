import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SedeComponent } from './sede.component';
import { SedeShowComponent } from './sede-show/sede-show.component';
import { SedeFormComponent } from './sede-form/sede-form.component';
import { SharedModule } from 'src/app/components/shared.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { PageLayoutModule } from '../../../../@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '../../../../@vex/components/breadcrumbs/breadcrumbs.module';

const routes: Routes = [
  {
    path: '**',
    component: SedeComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PipesModule,
    MateriaUdemyModule,
    ModalesFormModule,
    SharedModule,
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [SedeComponent, SedeFormComponent, SedeShowComponent],
  entryComponents: [SedeFormComponent, SedeShowComponent]
})
export class SedeModule { }
