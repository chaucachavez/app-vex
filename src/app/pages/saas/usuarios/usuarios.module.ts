import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsuariosComponent } from './usuarios.component';
import { UsuariosShowComponent } from './usuarios-show/usuarios-show.component';
import { UsuariosFormComponent } from './usuarios-form/usuarios-form.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { SharedModule } from 'src/app/components/shared.module';
import { PageLayoutModule } from '../../../../@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '../../../../@vex/components/breadcrumbs/breadcrumbs.module';

const routes: Routes = [
  {
    path: '**',
    component: UsuariosComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    PipesModule,
    MateriaUdemyModule,
    ModalesFormModule,
    SharedModule,
    ModalesFormModule,
    PageLayoutModule,
    BreadcrumbsModule
  ],
  declarations: [UsuariosComponent, UsuariosShowComponent, UsuariosFormComponent],
  entryComponents: [UsuariosShowComponent, UsuariosFormComponent]
})
export class UsuariosModule { }
