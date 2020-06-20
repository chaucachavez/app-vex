import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentasComponent } from './ventas.component';
import { VentasFormComponent } from './ventas-form/ventas-form.component';
import { VentasDescargaComponent } from './ventas-descarga/ventas-descarga.component';
import { VentasPdfComponent } from './ventas-pdf/ventas-pdf.component';
import { VentasGeneralComponent } from './ventas-general/ventas-general.component';
import { VentasGuiaComponent } from './ventas-guia/ventas-guia.component';
import { VentasFormatoComponent } from './ventas-formato/ventas-formato.component';
import { VentasItemComponent } from './ventas-item/ventas-item.component';
import { VentasNotacreditoComponent } from './ventas-notacredito/ventas-notacredito.component';
import { VentasMediopagoComponent } from './ventas-mediopago/ventas-mediopago.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MateriaUdemyModule } from 'src/app/materia-udemy/materia-udemy.module';
import { ModalesFormModule } from 'src/app/components/modales-form.module';
import { SharedModule } from 'src/app/components/shared.module';
import { PageLayoutModule } from '../../../../@vex/components/page-layout/page-layout.module';
import { BreadcrumbsModule } from '../../../../@vex/components/breadcrumbs/breadcrumbs.module';
import { VentasRegenerarComponent } from './ventas-regenerar/ventas-regenerar.component';
import { VentasEmitirComponent } from './ventas-emitir/ventas-emitir.component';

const routes: Routes = [
  {
    path: '',
    component: VentasComponent
  },
  {
    path: 'nuevo',
    component: VentasFormComponent
  },
  {
    path: 'nuevo/:comprobante',
    component: VentasFormComponent
  },
  {
    path: 'emitir',
    component: VentasEmitirComponent
  },
  {
    path: 'emitir/:comprobante',
    component: VentasEmitirComponent
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
  declarations: [
    VentasComponent,
    VentasFormComponent,
    VentasDescargaComponent,
    VentasPdfComponent,
    VentasGeneralComponent,
    VentasGuiaComponent,
    VentasFormatoComponent,
    VentasItemComponent,
    VentasNotacreditoComponent,
    VentasMediopagoComponent,
    VentasRegenerarComponent,
    VentasEmitirComponent
  ],
  entryComponents: [
    VentasDescargaComponent,
    VentasPdfComponent,
    VentasGeneralComponent,
    VentasGuiaComponent,
    VentasFormatoComponent,
    VentasItemComponent,
    VentasNotacreditoComponent,
    VentasMediopagoComponent,
    VentasRegenerarComponent,
    VentasEmitirComponent
  ]
})
export class VentasModule { }
