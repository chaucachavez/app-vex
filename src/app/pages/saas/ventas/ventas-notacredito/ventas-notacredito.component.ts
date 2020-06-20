import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataInicial } from 'src/app/services/datainicial';
import icClose from '@iconify/icons-ic/twotone-close';
import icSearch from '@iconify/icons-ic/twotone-search';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-ventas-notacredito',
  templateUrl: './ventas-notacredito.component.html',
  styleUrls: ['./ventas-notacredito.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasNotacreditoComponent implements OnInit {

  @ViewChild('serienc', { static: false }) seriencElement: ElementRef;

  notacreditoForm: FormGroup;
  operaciones: any[] = this._datainicial.operaciones;
  comprobantes: any[] = this._datainicial.comprobantenc;
  motivos: any[] = [];

  icClose = icClose;
  icSearch = icSearch;

  constructor(
    @Inject(MAT_DIALOG_DATA) public _data: any,
    public matDialogRef: MatDialogRef<VentasNotacreditoComponent>,
    private _datainicial: DataInicial
  ) {
    console.log(_data);
    if (_data.iddocumentofiscal === 10) {
      this.motivos = this._datainicial.tipond;
    }

    if (_data.iddocumentofiscal === 13) {
      this.motivos = this._datainicial.tiponc;
    }
  }

  ngOnInit(): void {
    this.notacreditoForm = this.createForm();

    if (!this._data.documentonc) {
      const caracter = this._data.serie.substr(0, 1);
      console.log(caracter);
      this.notacreditoForm.get('documentonc').setValue(caracter === 'F' ? 1 : 2);
      this.notacreditoForm.get('serienc').setValue(caracter);
      setTimeout(() => {
        this.seriencElement.nativeElement.focus();
      }, 100);
    }
  }

  createForm(): FormGroup {
    return new FormGroup({
      tiponc: new FormControl(this._data.tiponc, [Validators.required]),
      documentonc: new FormControl(this._data.documentonc, [Validators.required]),
      serienc: new FormControl(this._data.serienc, [Validators.required, Validators.minLength(3), Validators.maxLength(4)]),
      numeronc: new FormControl(this._data.numeronc, [Validators.required, Validators.min(1)])
    });
  }

  selected(item: any): void {
    console.log(item);
    this.notacreditoForm.get('serienc').setValue(item === 1 ? 'F' : 'B');
    setTimeout(() => {
      this.seriencElement.nativeElement.focus();
    }, 100);
  }

  save(): void {
    let param: any = {};
    param = this.notacreditoForm.getRawValue();

    this.matDialogRef.close(param);
  }
}


