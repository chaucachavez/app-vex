import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Utils } from '../../../../app/services/utils';
import { EntidadService } from '../../../../app/services/entidad.service';
import { CicloService } from '../../../../app/services/ciclo.service';
import { ACUENTAVENTA_VENTA } from '../../../../app/config/config';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-presupuesto-tpv',
  templateUrl: './presupuesto-tpv.component.html',
  styleUrls: ['./presupuesto-tpv.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PresupuestoTpvComponent implements OnInit {

  presupuestoForm: FormGroup;
  ciclo: any;
  submitted = false;
  loading: boolean;
  idcicloatencion: any;
  dialogTitle: string;
  ACUENTAVENTA_VENTA: boolean = ACUENTAVENTA_VENTA;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<PresupuestoTpvComponent>,
    private snackBar: MatSnackBar,
    private _entidadService: EntidadService,
    private _cicloService: CicloService,
    private _utils: Utils
  ) {
    this.idcicloatencion = _data.idcicloatencion;
    this.dialogTitle = 'Presupuesto del';
    this.loading = false;
    console.log(ACUENTAVENTA_VENTA, this.ACUENTAVENTA_VENTA);
  }

  calcularTotales(): void {
    let tratamiento = 0;
    const acuenta = this.presupuestoForm.get('acuenta').value;
    const descuento = this.presupuestoForm.get('descuento').value;
    this.presupuestodet.value.forEach(element => {
      if (element.cantidad > 0) {
        tratamiento += this._utils.redondearValor(element.cantidad * element.preciounit, 2);
      }
    });

    const total = tratamiento + acuenta - descuento;
    this.presupuestoForm.get('tratamiento').setValue(tratamiento);
    this.presupuestoForm.get('total').setValue(total);
  }

  ngOnInit(): void {
    this.presupuestoForm = this.createForm();

    this.presupuestoForm.get('presupuestodet').valueChanges.subscribe((changes) => {
      console.log('calcularTotales');
      this.calcularTotales();
    });

    this.presupuestoForm.get('acuenta').valueChanges.subscribe((acuenta) => {
      console.log('acuenta', acuenta);
      const tratamiento = this.presupuestoForm.get('tratamiento').value;
      const descuento = this.presupuestoForm.get('descuento').value;
      const total = this._utils.redondearValor(tratamiento + acuenta - descuento, 2);

      this.presupuestoForm.get('total').setValue(total);
    });

    this.presupuestoForm.get('descuento').valueChanges.subscribe((descuento) => {
      console.log('descuento', descuento);
      const tratamiento = this.presupuestoForm.get('tratamiento').value;
      const acuenta = this.presupuestoForm.get('acuenta').value;
      const total = this._utils.redondearValor(tratamiento + acuenta - descuento, 2);
      this.presupuestoForm.get('total').setValue(total);
    });

    this.show();
  }

  createForm(): FormGroup {
    return new FormGroup({
      idcicloatencion: new FormControl(this.idcicloatencion),
      presupuesto: new FormControl('', [Validators.required]),
      pago: new FormControl('', [Validators.required]),
      porpagar: new FormControl('', [Validators.required]),
      tratamiento: new FormControl({ value: '0', disabled: true }, [Validators.required]),
      acuenta: new FormControl(0, [Validators.required, Validators.min(0)]),
      descuento: new FormControl(0, [Validators.required, Validators.min(0)]),
      total: new FormControl({ value: '0', disabled: true }, [Validators.required]),
      presupuestodet: new FormArray([])
    });
  }

  get presupuestodet(): FormArray {
    return this.presupuestoForm.get('presupuestodet') as FormArray;
  }

  save(): void | boolean {
    let param;
    param = this.presupuestoForm.getRawValue();

    const presupuestodet: any[] = [];
    param.presupuestodet.forEach(element => {
      if (element.cantidad > 0) {
        presupuestodet.push(element);
      }
    });

    if (presupuestodet.length === 0 && param.acuenta === 0) {
      let sms = 'Ingrese Cantidad';
      if (ACUENTAVENTA_VENTA) {
        sms += ' ó Acuenta';
      }
      // swal('Upss!', sms, 'error');
      return false;
    }

    param.presupuestodet = presupuestodet;
    this.matDialogRef.close(param);
  }

  show(): void {

    const param = {
      idempresa: this._entidadService.usuario.idempresa,
      conRecurso: 'presupuesto.detalle.producto'
    };

    this.loading = true;

    this._cicloService.show(this.idcicloatencion, param)
      .subscribe((data: any) => {
        this.ciclo = data.data;

        const porpagar = parseFloat(this.ciclo.presupuesto.total) - parseFloat(this.ciclo.presupuesto.montopago);
        this.presupuestoForm.get('presupuesto').setValue(parseFloat(this.ciclo.presupuesto.total));
        this.presupuestoForm.get('pago').setValue(parseFloat(this.ciclo.presupuesto.montopago));
        this.presupuestoForm.get('porpagar').setValue(porpagar);

        data.data.presupuesto.detalle.forEach(item => {
          let preciounit = 0;
          let total = 0;
          switch (data.data.presupuesto.tipotarifa) {
            case 1:
              preciounit = parseFloat(item.preciounitregular);
              total = parseFloat(item.totalregular);

              break;
            case 2:
              preciounit = parseFloat(item.preciounitefectivo);
              total = parseFloat(item.totaltarjeta);
              break;
            case 3:
              preciounit = parseFloat(item.preciounitefectivo);
              total = parseFloat(item.preciounittarjeta);
              break;
          }

          const servicio = {
            cantidad: '',
            producto: { idproducto: item.producto.idproducto, nombre: item.producto.nombre },
            cantidadcliente: item.cantcliente,
            cantidadpagada: item.cantpagada,
            preciounit,
            total
          };

          this.addItem(servicio);
        });
        this.loading = false;
      });
  }

  addItem(item?: any): void | boolean {
    const max = item.cantidadcliente - item.cantidadpagada || 0;
    console.log('max', max);
    const phone = new FormGroup({
      cantidad: new FormControl(item ? item.cantidad : '', [Validators.min(0), Validators.max(max)]),
      producto: new FormControl(item ? item.producto : '', [Validators.required]),
      cantidadcliente: new FormControl(item ? item.cantidadcliente : '', [Validators.required]),
      cantidadpagada: new FormControl(item ? item.cantidadpagada : ''),
      preciounit: new FormControl(item ? item.preciounit : '', [Validators.required]),
      total: new FormControl(item ? item.total : '', [Validators.required])
    });
    this.presupuestodet.push(phone);
  }
}

export interface Producto {
  idproducto: number;
  codigo: string;
  nombre: string;
  precio: number;
}
