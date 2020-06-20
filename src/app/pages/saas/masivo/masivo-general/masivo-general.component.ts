import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { map, debounceTime, tap, switchMap, finalize, startWith } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataInicial } from 'src/app/services/datainicial';
import icClose from '@iconify/icons-ic/twotone-close';
import icSearch from '@iconify/icons-ic/twotone-search';
import icDomain from '@iconify/icons-ic/twotone-domain';
import icAccountCircle from '@iconify/icons-ic/twotone-account-circle';
import { EntidadService } from 'src/app/services/entidad.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-masivo-general',
  templateUrl: './masivo-general.component.html',
  styleUrls: ['./masivo-general.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasivoGeneralComponent implements OnInit {

  // Formulario
  generalForm: FormGroup;

  // Buscador cliente
  cliente = new FormControl();
  searchResult: any = { data: [], to: null, total: null };
  isLoadingSearch = false;

  // Data inicial y listados
  monedas: any[] = this._datainicial.monedas;
  formatos: any[] = this._datainicial.formatos;
  operaciones: any[] = this._datainicial.operaciones;

  // Iconos
  icClose = icClose;
  icSearch = icSearch;
  icDomain = icDomain;
  icAccountCircle = icAccountCircle;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<MasivoGeneralComponent>,
    private _entidadService: EntidadService,
    private _datainicial: DataInicial
  ) {
    this._data = this._data.venta;
  }

  ngOnInit(): void {

    if (this._data.idcliente) {
      this.cliente.setValue({
        identidad: this._data.idcliente,
        entidad: this._data.clientenombre
      });
    }

    this.generalForm = this.createForm();

    this.cliente.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingSearch = true),
        switchMap(data => {
          console.log('cliente valueChanges', data);
          if (typeof data === 'string') {
            this.generalForm.get('idcliente').setValue(null);
            this.generalForm.get('clientenombre').setValue(null);
            this.generalForm.get('clientedoc').setValue(null);
            this.generalForm.get('clientenumerodoc').setValue(null, { emitEvent: false });
            this.generalForm.get('clientedireccion').setValue(null);
          }

          if (typeof data === 'string' && data) {
            console.log('get API CLIENTE');
            const param = {
              idempresa: this._entidadService.usuario.idempresa,
              page: 1,
              pageSize: 10,
              orderName: 'entidad',
              orderSort: 'asc'
            };

            if (parseFloat(data) > 0) {
              param['likeNumerodoc'] = data;
            } else {
              param['likeEntidad'] = data;
            }

            return this._entidadService.index(param)
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
  }

  createForm(): FormGroup {

    return new FormGroup({
      fechaemision: new FormControl(this._data.fechaemision, [Validators.required]),
      fechavencimiento: new FormControl(this._data.fechavencimiento),
      moneda: new FormControl(this._data.moneda),
      tipocambio: new FormControl(this._data.tipocambio),
      operacion: new FormControl(this._data.operacion, [Validators.required]),
      pdfformato: new FormControl(this._data.pdfformato, [Validators.required]),
      condicionpago: new FormControl(this._data.condicionpago),
      observacion: new FormControl(this._data.observacion),
      detraccion: new FormControl(this._data.detraccion),
      selvaproducto: new FormControl(this._data.selvaproducto),
      selvaservicio: new FormControl(this._data.selvaservicio),

      idcliente: new FormControl(this._data.idcliente),
      clientenombre: new FormControl(this._data.clientenombre),
      clientedoc: new FormControl(this._data.clientedoc),
      clientenumerodoc: new FormControl(this._data.clientenumerodoc),
      clientedireccion: new FormControl(this._data.clientedireccion)
    });
  }

  save(): void {
    let param: any = {};
    param = this.generalForm.getRawValue();

    this.matDialogRef.close(param);
  }

  displaySearchEntidad(item?: any): string | null {
    return item ? item.entidad : null;
  }

  autocompletadoClienteSelected(data: any): void {
    if (data) {
      console.log('Selected', data);
      this.generalForm.get('idcliente').setValue(data.identidad);
      this.generalForm.get('clientenombre').setValue(data.entidad);
      this.generalForm.get('clientedoc').setValue(data.iddocumento);
      this.generalForm.get('clientenumerodoc').setValue(data.numerodoc);
      this.generalForm.get('clientedireccion').setValue(data.direccion);
    }
  }
}


