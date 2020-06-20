import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmpresaComponent } from './empresa.component';
import { EmpresaShowComponent } from './empresa-show/empresa-show.component';
import { EmpresaFormComponent } from './empresa-form/empresa-form.component';
import { SharedModule } from 'src/app/components/shared.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { PageLayoutModule } from '../../../../@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '../../../../@vex/components/breadcrumbs/breadcrumbs.module';

const routes: Routes = [
  {
    path: '**',
    component: EmpresaComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    PipesModule,
    MateriaUdemyModule,
    ModalesFormModule,
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [
    EmpresaComponent,
    EmpresaShowComponent,
    EmpresaFormComponent
  ],
  entryComponents: [EmpresaFormComponent, EmpresaShowComponent]
})
export class EmpresaModule { }
