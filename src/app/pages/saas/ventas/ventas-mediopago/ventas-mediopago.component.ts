import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Utils } from 'src/app/services/utils';
import { DataInicial } from 'src/app/services/datainicial';

import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icArrowDownward from '@iconify/icons-ic/twotone-arrow-downward';
import icDeleteSweep from '@iconify/icons-ic/twotone-delete-sweep';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-ventas-mediopago',
  templateUrl: './ventas-mediopago.component.html',
  styleUrls: ['./ventas-mediopago.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasMediopagoComponent implements OnInit {

  mediopagoForm: FormGroup;
  mediosdepago: any[] = this._datainicial.mediosdepago;

  icAdd = icAdd;
  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;
  icArrowDownward = icArrowDownward;
  icDeleteSweep = icDeleteSweep;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<VentasMediopagoComponent>,
    private _utils: Utils,
    private _datainicial: DataInicial
  ) {
    console.log('_data', _data);
  }

  ngOnInit(): void {
    this.mediopagoForm = this.createForm();

    this.mediopagoForm.get('mediopago').valueChanges.subscribe((changes) => {
      changes.forEach((item: any, index: number) => {

        // const importe = item.importe ? this._utils.redondearValor(item.importe, 2) : null;
        // const importe = this._utils.redondearValor(item.importe, 2);
        // console.log('Item y importe', item, importe);

        // this.mediopago.at(index).get('importe').setValue(importe, { emitEvent: false });

        this.calcularTotales();
      });

    });

    this.addItem();
  }

  createForm(): FormGroup {
    return new FormGroup({
      total: new FormControl(this._data.venta.total, [Validators.required]),
      pagado: new FormControl(0, [Validators.required]),
      vuelto: new FormControl(0, [Validators.required, Validators.min(0)]),
      mediopago: new FormArray([]),
    });
  }

  calcularTotales(): void {
    const total = this.mediopagoForm.get('total').value;
    let pagado = 0;
    let vuelto = 0;

    this.mediopago.value.forEach(item => {
      if (item.importe) {
        pagado += item.importe;
      }
    });

    vuelto = this._utils.redondearValor(pagado - total, 2);

    this.mediopagoForm.get('pagado').setValue(pagado);
    this.mediopagoForm.get('vuelto').setValue(vuelto);
  }

  save(): void {
    let param: any = {};
    param = this.mediopagoForm.getRawValue(); 

    this.matDialogRef.close(param);
  }

  get mediopago(): FormArray {
    return this.mediopagoForm.get('mediopago') as FormArray;
  }

  addItem(): void | boolean {
    const phone = new FormGroup({
      idmediopago: new FormControl(1),
      importe: new FormControl('', [Validators.required, Validators.min(0.10)]),
      nota: new FormControl('')
    });

    this.mediopago.push(phone);
  }

  deleteItem(index: number): void {
    this.mediopago.removeAt(index);
  }

  pagoRapido(valor: number): void {
    let aplicado = false;

    this.mediopago.value.forEach((item: any, index: number) => {
      if (!aplicado) {
        let importeActual = this.mediopago.at(index).get('importe').value || 0;
        if (importeActual === 0) {
          aplicado = true;
          importeActual = importeActual + valor;
          this.mediopago.at(index).get('importe').setValue(importeActual);
        }
      }
    });

    if (!aplicado) {
      const index = this.mediopago.length - 1;
      let importeActual = this.mediopago.at(index).get('importe').value || 0;
      importeActual = importeActual + valor;
      this.mediopago.at(index).get('importe').setValue(importeActual);
    }
  }
}
