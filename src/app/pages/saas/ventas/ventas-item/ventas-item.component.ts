import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import icClose from '@iconify/icons-ic/twotone-close';
import icSearch from '@iconify/icons-ic/twotone-search';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-ventas-item',
  templateUrl: './ventas-item.component.html',
  styleUrls: ['./ventas-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasItemComponent implements OnInit {

  itemForm: FormGroup;
  productos: Producto[] = [];
  filteredOptions: Observable<Producto[]>;
  stock = new FormControl({ value: null, disabled: true });

  @ViewChild('producto', { static: false }) productoElement: ElementRef;

  icClose = icClose;
  icSearch = icSearch;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    public matDialogRef: MatDialogRef<VentasItemComponent>,
    private _utils: Utils
  ) {

  }

  ngOnInit(): void {
    this.itemForm = this.createForm();

    this.itemForm.controls['idimpuesto'].valueChanges
      .subscribe(value => {
        const idimpuesto = this.itemForm.get('idimpuesto').value || 0;
        const preciounit = this.itemForm.get('preciounit').value || 0;
        const cantidad = this.itemForm.get('cantidad').value || 0;
        const descuento = this.itemForm.get('descuento').value || 0;

        this.calculoItem(idimpuesto, preciounit, cantidad, descuento);
      });

    this.itemForm.controls['cantidad'].valueChanges
      .subscribe(value => {
        const idimpuesto = this.itemForm.get('idimpuesto').value || 0;
        const preciounit = this.itemForm.get('preciounit').value || 0;
        const cantidad = value || 0;
        const descuento = this.itemForm.get('descuento').value || 0;

        this.calculoItem(idimpuesto, preciounit, cantidad, descuento);
      });

    this.itemForm.controls['preciounit'].valueChanges
      .subscribe(value => {
        const idimpuesto = this.itemForm.get('idimpuesto').value || 0;
        const preciounit = value || 0;
        const cantidad = this.itemForm.get('cantidad').value || 0;
        const descuento = this.itemForm.get('descuento').value || 0;

        this.calculoItem(idimpuesto, preciounit, cantidad, descuento);
      });

    this.itemForm.controls['descuento'].valueChanges
      .subscribe(value => {
        const idimpuesto = this.itemForm.get('idimpuesto').value || 0;
        const preciounit = this.itemForm.get('preciounit').value || 0;
        const cantidad = this.itemForm.get('cantidad').value || 0;
        const descuento = value || 0;

        this.calculoItem(idimpuesto, preciounit, cantidad, descuento);
      });

    this.filteredOptions = this.itemForm.controls['producto'].valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' || value === null ? value : value.nombre),
        map(name => name ? this._filterStates(name) : this._data.productos.slice())
      );

    this.itemForm.controls['producto'].valueChanges
      .subscribe(value => {
        console.log('ValueChange: ', value);
        if (typeof value === 'string') {
          this.itemForm.get('idimpuesto').setValue(null, { emitEvent: false });
          this.itemForm.get('cantidad').setValue(null, { emitEvent: false });
          this.itemForm.get('preciounit').setValue(null, { emitEvent: false });
          this.itemForm.get('valorunit').setValue(null, { emitEvent: false });
          this.itemForm.get('descuento').setValue(null, { emitEvent: false });
          this.itemForm.get('valorventa').setValue(null, { emitEvent: false });
          this.itemForm.get('montototalimpuestos').setValue(null, { emitEvent: false });
          this.itemForm.get('total').setValue(null, { emitEvent: false });

          this.stock.setValue(null);
        }
      });

    // Refresca cambios para el Autocomplete
    if (this._data.item.producto) {
      setTimeout(() => {
        this.itemForm.get('producto').updateValueAndValidity();
      }, 100);
    }

    if (!this._data.item.producto) {
      setTimeout(() => {
        // this.productoElement.nativeElement.focus();
      }, 300);
    }

  }

  private _filterStates(value: string): Producto[] {

    const filterValue = value.toLowerCase();
    console.log('filterValue: ', filterValue);
    return this._data.productos.filter(state => state.nombre.toLowerCase().indexOf(filterValue) === 0);
  }

  private calculoItem(idimpuesto: number, preciounit: number, cantidad: number, descuento: number): void {

    const valSubImpTot = this._utils.calculoLinea(idimpuesto, preciounit, cantidad, descuento);

    // this.itemForm.get('cantidad').setValue(cantidad, { emitEvent: false });
    // this.itemForm.get('preciounit').setValue(preciounit, { emitEvent: false });
    this.itemForm.get('valorunit').setValue(valSubImpTot.valorunit, { emitEvent: false });
    // this.itemForm.get('descuento').setValue(descuento, { emitEvent: false });
    this.itemForm.get('valorventa').setValue(valSubImpTot.subtotal, { emitEvent: false });
    this.itemForm.get('montototalimpuestos').setValue(valSubImpTot.montototalimpuestos, { emitEvent: false });
    this.itemForm.get('total').setValue(valSubImpTot.total, { emitEvent: false });
  }

  createForm(): FormGroup {
    return new FormGroup({
      producto: new FormControl(this._data.item.producto, [Validators.required]),
      descripcion: new FormControl(this._data.item.descripcion || null),
      idimpuesto: new FormControl(this._data.item.idimpuesto || null, [Validators.required]),
      preciounit: new FormControl(this._data.item.preciounit || null, [Validators.required]),
      cantidad: new FormControl(this._data.item.cantidad || null, [Validators.required]),
      valorunit: new FormControl(this._data.item.valorunit || null, [Validators.required]),
      descuento: new FormControl(this._data.item.descuento || null),
      valorventa: new FormControl(this._data.item.valorventa, [Validators.required]),
      montototalimpuestos: new FormControl(this._data.item.montototalimpuestos, [Validators.required]),
      total: new FormControl(this._data.item.total, [Validators.required])
    });
  }

  displayProductoFn(user?): string | undefined {
    return user ? user.nombre : undefined;
  }

  autocompletadoProductoSelected(option: any): void {
    console.log('OPTION', option);
    const cantidad = 1;
    const preciounit = parseFloat(option.precio);
    const valSubImpTot = this._utils.calculoLinea(option.idimpuesto, preciounit, cantidad);

    this.itemForm.get('cantidad').setValue(cantidad, { emitEvent: false });
    this.itemForm.get('preciounit').setValue(preciounit, { emitEvent: false });
    this.itemForm.get('valorunit').setValue(valSubImpTot.valorunit, { emitEvent: false });
    // this.itemForm.get('descuento').setValue(descuento, { emitEvent: false });
    this.itemForm.get('valorventa').setValue(valSubImpTot.subtotal, { emitEvent: false });
    this.itemForm.get('montototalimpuestos').setValue(valSubImpTot.montototalimpuestos, { emitEvent: false });
    this.itemForm.get('total').setValue(valSubImpTot.total, { emitEvent: false });

    this.itemForm.get('idimpuesto').setValue(option.idimpuesto, { emitEvent: false });
    this.stock.setValue(option.codigo);
  }

  save(): void {

    let param: any = {};
    param = this.itemForm.getRawValue();

    this.matDialogRef.close(param);
  }
}

export interface Producto {
  idproducto: number;
  codigo: string;
  nombre: string;
  precio: number;
  unidadmedida: string;
}
