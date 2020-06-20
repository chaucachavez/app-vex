import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import { DataInicial } from 'src/app/services/datainicial';
import { URL_SERVICIOS } from 'src/app/config/config';
import { ProductoService } from 'src/app/services/producto.service';
import { Utils } from 'src/app/services/utils';
import icClose from '@iconify/icons-ic/twotone-close';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-items-carga',
  templateUrl: './items-carga.component.html',
  styleUrls: ['./items-carga.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ItemsCargaComponent implements OnInit {

  cargaForm: FormGroup;
  buttons = {
    browse: 'Seleccionar',
    clear: 'Cancelar',
    upload: 'Subir'
  };

  path = {
    saveUrl: URL_SERVICIOS + '/productos/import/excel'
    // removeUrl: 'https://aspnetmvc.syncfusion.com/services/api/uploadbox/Remove'
  };

  icClose = icClose;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<ItemsCargaComponent>,
    private snackBar: MatSnackBar,
    private _datainicial: DataInicial,
    private _productoService: ProductoService,
    private _utils: Utils
  ) {
    // this._data = this._data.venta;
  }

  ngOnInit(): void {
    this.cargaForm = this.createForm();
  }

  public onUploadSuccess(args: any): void {
    if (args.operation === 'upload') {
      console.log('args', args);
      // this.matDialogRef.close(true);
      this.snackBar.open(`Productos cargados exitósamente`, 'Cerrar', { duration: 4000 });
    }
  }

  public onUploadFailure(args: any): void {

    let mensaje: string;
    if (args.e.target.response.slice(0, 15) === '<!DOCTYPE html>') {
      mensaje = 'Error en carga. Contacte con ventas@ifact.pe';
    } else {
      mensaje = this._utils.convertError(JSON.parse(args.e.target.response).error);
    }

    this.snackBar.open(`${mensaje}`, 'Cerrar', { duration: 7000, panelClass: ['error-dialog'] });
  }

  createForm(): FormGroup {
    return new FormGroup({
      fechavencimiento: new FormControl(null),
      tipocambio: new FormControl(null),
      placavehiculo: new FormControl(null),
      pdfformato: new FormControl(null),
      detraccion: new FormControl(null),
      operacion: new FormControl(null),
      selvaproducto: new FormControl(null),
      selvaservicio: new FormControl(null)
    });
  }

  descargaTemplate(): void {
    this._productoService.exportTemplateExcel().subscribe((data) => {
      saveAs(data, 'plantilla_Productos.xlsx');
    }, (error) => {
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  public addHeaders(args: any): void {

    let token = '';
    if (localStorage.getItem('tokenPF')) {
      token = localStorage.getItem('tokenPF');
    }

    args.currentRequest.setRequestHeader('Authorization', token);
  }

  save(): void {
    let param: any = {};
    param = this.cargaForm.getRawValue();

    this.matDialogRef.close(param);
  }
}
