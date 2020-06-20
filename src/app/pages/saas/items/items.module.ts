import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemsComponent } from './items.component';
import { ItemsCargaComponent } from './items-carga/items-carga.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { SharedModule } from 'src/app/components/shared.module';
import { PageLayoutModule } from 'src/@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from 'src/@vex/components/breadcrumbs/breadcrumbs.module';

const routes: Routes = [
  {
    path: '**',
    component: ItemsComponent
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
  entryComponents: [ItemsCargaComponent],
  declarations: [ItemsComponent, ItemsCargaComponent]
})
export class ItemsModule { }
