import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MateriaUdemyModule } from '../materia-udemy/materia-udemy.module';
import { SharedModule } from './shared.module';
import { EntidadShowComponent } from './entidad/entidad-show/entidad-show.component';
import { VentaShowComponent } from './venta/venta-show/venta-show.component';
import { VentasAnularComponent } from './venta/ventas-anular/ventas-anular.component';
import { VentasCorreoComponent } from './venta/ventas-correo/ventas-correo.component';
import { VentaSearchComponent } from './venta/venta-search/venta-search.component';
import { PresupuestoTpvComponent } from './presupuesto/presupuesto-tpv/presupuesto-tpv.component';
import { VentaDowloandComponent } from './venta/venta-dowloand/venta-dowloand.component';
import { ContactoFormComponent } from './contacto/contacto-form/contacto-form.component';
import { ContactoShowComponent } from './contacto/contacto-show/contacto-show.component';
import { ItemShowComponent } from './item/item-show/item-show.component';
import { ItemFormComponent } from './item/item-form/item-form.component';
import { SedeSelectionComponent } from './sede-selection/sede-selection.component';
import { ConfirmacionComponent } from './confirmacion/confirmacion.component';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    MateriaUdemyModule,
    PipesModule,
    SharedModule
  ],
  declarations: [
    EntidadShowComponent,
    VentaShowComponent,
    VentasAnularComponent,
    VentasCorreoComponent,
    VentaSearchComponent,
    PresupuestoTpvComponent,
    VentaDowloandComponent,
    ContactoFormComponent,
    ContactoShowComponent,
    ItemShowComponent,
    ItemFormComponent,
    SedeSelectionComponent,
    ConfirmacionComponent
  ],
  exports: [
  ],
  entryComponents: [
    EntidadShowComponent,
    VentaShowComponent,
    VentasAnularComponent,
    VentasCorreoComponent,
    VentaSearchComponent,
    PresupuestoTpvComponent,
    VentaDowloandComponent,
    ContactoFormComponent,
    ContactoShowComponent,
    ItemShowComponent,
    ItemFormComponent,
    SedeSelectionComponent,
    ConfirmacionComponent
  ],
})
export class ModalesFormModule { }
