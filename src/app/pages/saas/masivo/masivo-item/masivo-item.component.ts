import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { Utils } from 'src/app/services/utils';
import icClose from '@iconify/icons-ic/twotone-close';
import icSearch from '@iconify/icons-ic/twotone-search';
import { DataInicial } from 'src/app/services/datainicial';
import { EntidadService } from 'src/app/services/entidad.service';
import { ProductoService } from 'src/app/services/producto.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-masivo-item',
  templateUrl: './masivo-item.component.html',
  styleUrls: ['./masivo-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasivoItemComponent implements OnInit {
  // @ViewChild('producto', { static: false }) productoElement: ElementRef;

  itemForm: FormGroup;
  impuestos: any[] = this._datainicial.impuestos;
  stock = new FormControl({ value: null, disabled: true });

  /* BUSCARDOR PRODUCTO */
  producto = new FormControl();
  isLoadingSearch = false;
  searchResult = { data: null, to: null, total: null };
  /* BUSCARDOR PRODUCTO */

  icClose = icClose;
  icSearch = icSearch;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<MasivoItemComponent>,
    private _datainicial: DataInicial,
    private _entidadService: EntidadService,
    private _productoService: ProductoService,
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

    this.producto.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingSearch = true),
        switchMap(data => {

          if (typeof data === 'string') {
            console.log('setea NULL');
            this.itemForm.get('idproducto').setValue(null);
            this.itemForm.get('cantidad').setValue(null);
            this.itemForm.get('unidadmedida').setValue(null);
            this.itemForm.get('idimpuesto').setValue(null);
            this.itemForm.get('valorunit').setValue(null);
            this.itemForm.get('valorventa').setValue(null);
            this.itemForm.get('montototalimpuestos').setValue(null);
            this.itemForm.get('preciounit').setValue(null);
            this.itemForm.get('descuento').setValue(null);
            this.itemForm.get('total').setValue(null);
            this.itemForm.get('codigo').setValue(null);
            this.itemForm.get('codigosunat').setValue(null);
            this.itemForm.get('nombre').setValue(null);
            this.itemForm.get('descripcion').setValue(null);
            this.stock.setValue(null);
          }

          if (typeof data === 'string' && data) {
            console.log('get API');
            const param = {
              idempresa: this._entidadService.usuario.idempresa,
              page: 1,
              pageSize: 10,
              orderName: 'nombre',
              orderSort: 'asc',
              fields: 'idproducto,nombre,codigo,unidadmedida,idimpuesto,stock,codigosunat,costoventa,valorventa'
            };

            param['likeNombre'] = data;

            return this._productoService.index(param)
              .pipe(
                finalize(() => this.isLoadingSearch = false),
              );
          } else {
            this.isLoadingSearch = false;
            return [];
          }
        })
      )
      .subscribe((data: any) => {
        this.searchResult = data;
      });

    // setTimeout(() => {
    //   this.productoElement.nativeElement.focus();
    // }, 0);
  }

  private calculoItem(idimpuesto: number, preciounit: number, cantidad: number, descuento: number): void {

    const valSubImpTot = this._utils.calculoLinea(idimpuesto, preciounit, cantidad, descuento);

    this.itemForm.get('valorunit').setValue(valSubImpTot.valorunit, { emitEvent: false });
    this.itemForm.get('valorventa').setValue(valSubImpTot.subtotal, { emitEvent: false });
    this.itemForm.get('montototalimpuestos').setValue(valSubImpTot.montototalimpuestos, { emitEvent: false });
    this.itemForm.get('total').setValue(valSubImpTot.total, { emitEvent: false });
  }

  createForm(): FormGroup {

    if (this._data.item) {
      this.producto.setValue({
        codigo: this._data.item.codigo,
        nombre: this._data.item.nombre,
      });

      // Stock
      this.show();
    }

    return new FormGroup({
      idproducto: new FormControl(this._data.item ? this._data.item.idproducto : null),
      cantidad: new FormControl(this._data.item ? this._data.item.cantidad : null, [Validators.required]),
      unidadmedida: new FormControl(this._data.item ? this._data.item.unidadmedida : null, [Validators.required]),
      idimpuesto: new FormControl(this._data.item ? this._data.item.idimpuesto : null, [Validators.required]),
      valorunit: new FormControl(this._data.item ? this._data.item.valorunit : null, [Validators.required]),
      valorventa: new FormControl({ value: this._data.item ? this._data.item.valorventa : null, disabled: false },
        [Validators.required]),
      montototalimpuestos: new FormControl({ value: this._data.item ? this._data.item.montototalimpuestos : null, disabled: false },
        [Validators.required]),
      preciounit: new FormControl(this._data.item ? this._data.item.preciounit : null, [Validators.required]),
      descuento: new FormControl(this._data.item ? this._data.item.descuento : null),
      total: new FormControl({ value: this._data.item ? this._data.item.total : null, disabled: false },
        [Validators.required]),
      codigo: new FormControl(this._data.item ? this._data.item.codigo : null),
      codigosunat: new FormControl(this._data.item ? this._data.item.codigosunat : null),
      nombre: new FormControl(this._data.item ? this._data.item.nombre : null),
      descripcion: new FormControl(this._data.item ? this._data.item.descripcion : null)
    });
  }

  displayProductoFn(user?): string | undefined {
    return user ? user.nombre : undefined;
  }

  autocompletadoProductoSelected(option: any): void {

    const cantidad = 1;
    const preciounit = parseFloat(option.valorventa);
    const valSubImpTot = this._utils.calculoLinea(option.idimpuesto, preciounit, cantidad);

    this.itemForm.get('valorunit').setValue(valSubImpTot.valorunit);
    this.itemForm.get('valorventa').setValue(valSubImpTot.subtotal);
    this.itemForm.get('montototalimpuestos').setValue(valSubImpTot.montototalimpuestos);
    this.itemForm.get('total').setValue(valSubImpTot.total);
    this.itemForm.get('idproducto').setValue(option.idproducto);
    this.itemForm.get('cantidad').setValue(cantidad);
    this.itemForm.get('unidadmedida').setValue(option.unidadmedida);
    this.itemForm.get('idimpuesto').setValue(option.idimpuesto);
    this.itemForm.get('preciounit').setValue(preciounit);
    this.itemForm.get('descuento').setValue(null);
    this.itemForm.get('codigo').setValue(option.codigo);
    this.itemForm.get('codigosunat').setValue(option.codigosunat);
    this.itemForm.get('nombre').setValue(option.nombre);
    this.itemForm.get('descripcion').setValue(null);

    this.stock.setValue(option.stock);
  }

  show(): void {
    this._productoService.show(this._data.item.idproducto)
      .subscribe((data: any) => {
        this.stock.setValue(data.data.stock);
      });
  }

  save(): void {
    let param: any = {};
    param = this.itemForm.getRawValue();

    this.matDialogRef.close(param);
  }
}
