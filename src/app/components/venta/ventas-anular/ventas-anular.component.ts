import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataInicial } from 'src/app/services/datainicial';
import icClose from '@iconify/icons-ic/twotone-close';
import { VentaService } from 'src/app/services/venta.service';
import { Utils } from 'src/app/services/utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-ventas-anular',
  templateUrl: './ventas-anular.component.html',
  styleUrls: ['./ventas-anular.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasAnularComponent implements OnInit {

  @ViewChild('motivo', { static: false }) motivoElement: ElementRef;

  anularForm: FormGroup;
  formatos: any[] = this._datainicial.formatos;
  operaciones: any[] = this._datainicial.operaciones;
  icClose = icClose;

  submitted = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<VentasAnularComponent>,
    private _ventaService: VentaService,
    private snackBar: MatSnackBar,
    private _utils: Utils,
    private _datainicial: DataInicial
  ) {
    this._data = this._data.venta;
  }

  ngOnInit(): void {
    this.anularForm = this.createForm();

    setTimeout(() => {
      this.motivoElement.nativeElement.focus();
    }, 0);
  }

  createForm(): FormGroup {

    let comprobante: string;
    switch (this._data.iddocumentofiscal) {
      case 1:
        comprobante = 'Factura';
        break;
      case 2:
        comprobante = 'Boleta de venta';
        break;
      case 10:
        comprobante = 'Nota de débito';
        break;
      case 13:
        comprobante = 'Nota de crédito';
        break;
    }

    const fileName = `${comprobante} ${this._data.serie} - ${this._data.numero}`;
    return new FormGroup({
      comprobante: new FormControl({ value: fileName, disabled: false }),
      motivoanulacion: new FormControl(null),
    });
  }

  save(): void {
    let param: any = {};
    param = this.anularForm.getRawValue();

    let comprobante: string;
    switch (this._data.iddocumentofiscal) {
      case 1:
        comprobante = 'Factura';
        break;
      case 2:
        comprobante = 'Boleta de venta';
        break;
      case 10:
        comprobante = 'Nota de débito';
        break;
      case 13:
        comprobante = 'Nota de crédito';
        break;
    }

    const fileName = `${comprobante} ${this._data.serie} - ${this._data.numero}`;
    this.submitted = true;
    this._ventaService.anular(this._data.idventa, param).subscribe((data) => {
      this.submitted = false;
      this.snackBar.open(`${fileName} anulado.`, 'Cerrar');
      this.matDialogRef.close(data);
    }, error => {
      this.submitted = false;
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });

  }
}



