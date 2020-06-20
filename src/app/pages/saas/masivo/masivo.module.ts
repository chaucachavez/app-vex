import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasivoComponent } from './masivo.component';
import { MasivoShowComponent } from './masivo-show/masivo-show.component';
import { MasivoFormComponent } from './masivo-form/masivo-form.component';
import { SharedModule } from 'src/app/components/shared.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { PageLayoutModule } from '../../../../@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '../../../../@vex/components/breadcrumbs/breadcrumbs.module';
import { MasivoItemComponent } from './masivo-item/masivo-item.component';
import { MasivoGeneralComponent } from './masivo-general/masivo-general.component';
import { CountdownModule } from 'ngx-countdown';
const routes: Routes = [
  {
    path: '**',
    component: MasivoComponent
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
    BreadcrumbsModule,
    CountdownModule
  ],
  declarations: [
    MasivoComponent,
    MasivoShowComponent,
    MasivoFormComponent,
    MasivoItemComponent,
    MasivoGeneralComponent
  ],
  entryComponents: [MasivoFormComponent, MasivoShowComponent, MasivoItemComponent, MasivoGeneralComponent]
})
export class MasivoModule { }
