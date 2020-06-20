import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataInicial } from 'src/app/services/datainicial';
import icClose from '@iconify/icons-ic/twotone-close';
import icPictureAsPdf from '@iconify/icons-ic/twotone-picture-as-pdf';
import { VentaService } from 'src/app/services/venta.service';
import { Utils } from 'src/app/services/utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-ventas-regenerar',
  templateUrl: './ventas-regenerar.component.html',
  styleUrls: ['./ventas-regenerar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasRegenerarComponent implements OnInit {

  regenerarForm: FormGroup;
  formatos: any[] = this._datainicial.formatos;

  icClose = icClose;
  icPictureAsPdf = icPictureAsPdf;

  submitted = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<VentasRegenerarComponent>,
    private _ventaService: VentaService,
    private snackBar: MatSnackBar,
    private _utils: Utils,
    private _datainicial: DataInicial
  ) {
    this._data = this._data.venta;
  }

  ngOnInit(): void {
    this.regenerarForm = this.createForm();
  }

  createForm(): FormGroup {
    const fileName = `${this._data.docnegocio.nombre} ${this._data.serie} - ${this._data.numero}`;

    return new FormGroup({
      comprobante: new FormControl({ value: fileName, disabled: false }),
      pdfformato: new FormControl(null, [Validators.required])
    });
  }

  save(): void {
    const param: any = {
      pdfformato: this.regenerarForm.get('pdfformato').value
    };

    const fileName = `${this._data.docnegocio.nombre} ${this._data.serie} - ${this._data.numero}`;
    this.submitted = true;
    this._ventaService.regenerarPdf(this._data.idventa, param).subscribe((data) => {
      this.submitted = false;
      this.snackBar.open(`PDF de ${fileName} regenerado.`, 'Cerrar');
      this.matDialogRef.close(data);
    }, error => {
      this.submitted = false;
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });

  }
}



