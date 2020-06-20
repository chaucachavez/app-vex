import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriaComponent } from './categoria.component';
import { CategoriaShowComponent } from './categoria-show/categoria-show.component';
import { CategoriaFormComponent } from './categoria-form/categoria-form.component';
import { SharedModule } from 'src/app/components/shared.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { PageLayoutModule } from '../../../../@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '../../../../@vex/components/breadcrumbs/breadcrumbs.module';

const routes: Routes = [
  {
    path: '**',
    component: CategoriaComponent
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
    CategoriaComponent,
    CategoriaShowComponent,
    CategoriaFormComponent
  ],
  entryComponents: [CategoriaFormComponent, CategoriaShowComponent]
})
export class CategoriaModule { }
