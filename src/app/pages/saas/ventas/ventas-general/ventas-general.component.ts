import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataInicial } from 'src/app/services/datainicial';
import icClose from '@iconify/icons-ic/twotone-close';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-ventas-general',
  templateUrl: './ventas-general.component.html',
  styleUrls: ['./ventas-general.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasGeneralComponent implements OnInit {

  generalForm: FormGroup;
  formatos: any[] =  this._datainicial.formatos;
  // operaciones: any[] = this._datainicial.operaciones;
  icClose = icClose;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<VentasGeneralComponent>,
    private _datainicial: DataInicial
  ) {
    this._data = this._data.venta;
  }

  ngOnInit(): void {
    this.generalForm = this.createForm();
  }

  createForm(): FormGroup {
    return new FormGroup({
      // fechavencimiento: new FormControl(this._data.fechavencimiento),
      tipocambio: new FormControl(this._data.tipocambio),
      placavehiculo: new FormControl(this._data.placavehiculo),
      pdfformato: new FormControl(this._data.pdfformato),
      detraccion: new FormControl(this._data.detraccion),
      // operacion: new FormControl(this._data.operacion),
      selvaproducto: new FormControl(this._data.selvaproducto),
      selvaservicio: new FormControl(this._data.selvaservicio),
      // ordencompra: new FormControl(this._data.ordencompra),
      // guiaremitente: new FormControl(this._data.guiaremitente),
      guiatransportista: new FormControl(this._data.guiatransportista),
    });
  }

  save(): void {
    let param: any = {};
    param = this.generalForm.getRawValue();

    this.matDialogRef.close(param);
  }
}


