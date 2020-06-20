import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Utils } from 'src/app/services/utils';
import icClose from '@iconify/icons-ic/twotone-close';
import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icSearch from '@iconify/icons-ic/twotone-search';
import icSettings from '@iconify/icons-ic/twotone-settings';
import icCallMade from '@iconify/icons-ic/twotone-call-made';
import { EntidadService } from 'src/app/services/entidad.service';
import { DocumentoserieService } from 'src/app/services/documentoserie.service';
import { DataInicial } from 'src/app/services/datainicial';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { MasivoService } from 'src/app/services/masivo.service';
import { ProductoService } from 'src/app/services/producto.service';
import { PopoverService } from 'src/@vex/components/popover/popover.service';
import { MasivoGeneralComponent } from '../masivo-general/masivo-general.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'vex-masivo-form',
  templateUrl: './masivo-form.component.html',
  styleUrls: ['./masivo-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasivoFormComponent implements OnInit {

  // Focus
  @ViewChild('cantidad', { static: false }) cantidadElement: ElementRef;

  // Formulario
  categoriaForm: FormGroup;
  submitted = false;
  loading = false;
  loadMasivo = false;
  countdown: any = { leftTime: 0 };
  pipeDate = new DatePipe('es-Pe');

  // Sede
  sedes = [];
  sede = new FormControl(null, [Validators.required]);

  // Comprobante
  comprobante = new FormControl(null, [Validators.required]);
  comprobantes: any[] = [];

  // Buscador cliente
  cliente = new FormControl(null, [Validators.required]);
  isLoadingSearch = false;
  searchResult = { data: null, to: null, total: null };
  clienteDefault = {
    idcliente: 356,
    clientenombre: 'VARIOS',
    clientedoc: 5,
    clientenumerodoc: '-',
    clientedireccion: null
  };

  // Data inicial y listados
  tiponc: any[] = this._datainicial.tiponc;
  monedas: any[] = this._datainicial.monedas;
  impuestos: any[] = this._datainicial.impuestos;

  // Iconos
  icAdd = icAdd;
  icEdit = icEdit;
  icClose = icClose;
  icSearch = icSearch;
  icDelete = icDelete;
  icSettings = icSettings;
  icCallMade = icCallMade;

  // Leyenda
  leyenda = {
    exonerada: false,
    inafecta: false,
    gratuita: false,
    icpber: false
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<MasivoFormComponent>,
    private snackBar: MatSnackBar,
    private _matDialog: MatDialog,
    private _masivoService: MasivoService,
    private _entidadService: EntidadService,
    private _documentoserieService: DocumentoserieService,
    private _productoService: ProductoService,
    private _datainicial: DataInicial,
    private _utils: Utils,
    private popover: PopoverService
  ) {
    this.sedes = this._entidadService.sedes;
    this.sede.setValue(this._data.sedeDefault);
  }

  ngOnInit(): void {
    this.categoriaForm = this.createForm();

    this.categoriaForm.get('masivodet').valueChanges.subscribe((data) => {
      let exonerada = false;
      let inafecta = false;
      let gratuita = false;
      let icpber = false;
      data.forEach((item: any, index: number) => {
        switch (item.idimpuesto) {
          case 8: exonerada = true; break;
          case 9: inafecta = true; break;
          case 2: gratuita = true; break;
        }

        if (item.bolsa) {
          icpber = true;
        }
      });

      this.leyenda = { exonerada, inafecta, gratuita, icpber };
    });

    this.sede.valueChanges
      .subscribe(value => {
        this.categoriaForm.get('idsede').setValue(value ? value : null);
        this.comprobante.setValue(null); // Actualiza comprobante
        this.indexDocumentoseries();
      });

    this.comprobante.valueChanges
      .subscribe(value => {
        this.categoriaForm.get('iddocumentofiscal').setValue(value ? value.iddocumentofiscal : null);
        this.categoriaForm.get('serie').setValue(value ? value.serie : null);
      });

    this.categoriaForm.controls['cargo'].valueChanges
      .subscribe(value => {
        value = this._utils.redondearValor(value, 2);
        this.categoriaForm.get('cargo').setValue(value, { emitEvent: false });
        this.calcularTotales();
      });

    this.categoriaForm.controls['descuentoporcentaje'].valueChanges
      .subscribe(value => {
        value = this._utils.redondearValor(value, 2);
        this.categoriaForm.get('descuentoporcentaje').setValue(value, { emitEvent: false });
        this.calcularTotales();
      });

    this.indexDocumentoseries();
    this.addItem();
    this.addItem();
    this.addItem();

    setTimeout(() => {
      this.cantidadElement.nativeElement.focus();
    }, 0);
  }

  createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      idsede: new FormControl(this._data.sedeDefault),
      iddocumentofiscal: new FormControl(null, [Validators.required]),
      serie: new FormControl(null, [Validators.required]),
      // numerodel
      // numeroal
      idcliente: new FormControl(this.clienteDefault.idcliente),
      fechaemision: new FormControl(new Date(), [Validators.required]),
      idestadodocumento: new FormControl(27),
      // progreso
      cantidad: new FormControl(null, [Validators.min(1), Validators.max(500)]),
      // estado
      exonerada: new FormControl(null),
      inafecta: new FormControl(null),
      gratuita: new FormControl(null),
      gravada: new FormControl(null, [Validators.required]),
      descuentoporcentaje: new FormControl(null, [Validators.min(0)]),
      descuentoglobal: new FormControl(null),
      descuentoitem: new FormControl(null),
      descuentototal: new FormControl(null),
      valorimpuesto: new FormControl(null, [Validators.required]),
      cargo: new FormControl(null, [Validators.min(0)]),
      totalimpuestobolsa: new FormControl(null),
      total: new FormControl(null, [Validators.required]),
      // totalletra
      clientenombre: new FormControl(this.clienteDefault.clientenombre),
      clientedoc: new FormControl(this.clienteDefault.clientedoc),
      clientenumerodoc: new FormControl(this.clienteDefault.clientenumerodoc),
      clientedireccion: new FormControl(this.clienteDefault.clientedireccion),
      operacion: new FormControl(1),
      moneda: new FormControl('PEN'),
      tipocambio: new FormControl(null),
      fechavencimiento: new FormControl(null),
      detraccion: new FormControl(false),
      selvaproducto: new FormControl(false),
      selvaservicio: new FormControl(false),
      condicionpago: new FormControl(null),
      observacion: new FormControl(null),
      pdfformato: new FormControl('TICKET'),
      masivodet: new FormArray([], [Validators.required])
    });
  }

  indexDocumentoseries(): void {
    const param = {
      idsede: this.sede.value,
      conRecurso: 'documentofiscal',
      orderName: 'iddocumentofiscal',
      orderSort: 'asc'
    };

    this.comprobantes = [];
    this._documentoserieService.index(param)
      .subscribe((data: any) => {
        data.data.forEach(item => {
          if (item.iddocumentofiscal === 1 || item.iddocumentofiscal === 2) {
            this.comprobantes.push({
              iddocumentofiscal: item.iddocumentofiscal,
              documentofiscal: { nombre: item.documentofiscal.nombre },
              serie: item.serie,
              numero: item.numero
            });
          }
        });

        // Comprobante Boleta por defecto
        let itemSelected = null;
        this.comprobantes.forEach(item => {
          if (item.iddocumentofiscal === 2) {
            itemSelected = item;
          }
        });

        // Comprobante cualquiera por defecto
        if (!itemSelected && this.comprobantes.length > 0) {
          itemSelected = this.comprobantes[0];
        }

        if (itemSelected) {
          this.comprobante.setValue(itemSelected);
        }
      });
  }

  get ventadet(): FormArray {
    return this.categoriaForm.get('masivodet') as FormArray;
  }

  autocompletadoProductoSelected(phone: any): void {
    const item = phone.value;
    const idimpuesto = item.producto.idimpuesto || 1; // IGV por defecto
    const preciounit = item.producto.precio || 0;
    const cantidad = item.cantidad || 1;
    const descuento = item.descuento || null;
    const valSubImpTot = this._utils.calculoLinea(idimpuesto, preciounit, cantidad, descuento);

    this.setImpuesto(phone, valSubImpTot);
    this.setImpuestoBolsa(phone, cantidad, item.bolsa);
  }

  addItem(item?: any): void | boolean {

    const phone = new FormGroup({
      producto: new FormControl(item ? item.producto : null),
      descripcion: new FormControl(item ? item.descripcion : null),
      cantidad: new FormControl(item ? item.cantidad : null),
      valorunit: new FormControl(item ? item.valorunit : null),
      descuento: new FormControl(item ? item.descuento : null),
      valorventa: new FormControl({ value: item ? item.valorventa : null, disabled: true }),
      impuestobolsa: new FormControl({ value: item ? item.impuestobolsa : null, disabled: true }),
      idimpuesto: new FormControl(item ? item.idimpuesto : 1), // , IGV
      montototalimpuestos: new FormControl({ value: item ? item.montototalimpuestos : null, disabled: true }),
      preciounit: new FormControl(item ? item.preciounit : null),
      total: new FormControl(item ? item.total : null),
      bolsa: new FormControl(item ? item.bolsa : false),
      datalist: new FormArray([]),
      datalistloading: new FormControl(false)
    });

    phone.controls['cantidad'].valueChanges
      .subscribe(data => {
        item = phone.value;
        item.cantidad = data;
        const idimpuesto = item.idimpuesto;
        const preciounit = item.preciounit;
        const cantidad = item.cantidad;
        const descuento = item.descuento || null;
        const valSubImpTot = this._utils.calculoLinea(idimpuesto, preciounit, cantidad, descuento);

        this.setImpuesto(phone, valSubImpTot);
        this.setImpuestoBolsa(phone, item.cantidad, item.bolsa);
      });

    phone.controls['idimpuesto'].valueChanges
      .subscribe(data => {
        item = phone.value;
        item.idimpuesto = data;
        const idimpuesto = item.idimpuesto;
        const preciounit = item.preciounit;
        const cantidad = item.cantidad;
        const descuento = item.descuento || null;
        const valSubImpTot = this._utils.calculoLinea(idimpuesto, preciounit, cantidad, descuento);

        this.setImpuesto(phone, valSubImpTot);
      });

    phone.controls['preciounit'].valueChanges
      .subscribe(data => {
        item = phone.value;
        item.preciounit = data;
        const idimpuesto = item.idimpuesto;
        const preciounit = item.preciounit;
        const cantidad = item.cantidad;
        const descuento = item.descuento || null;
        const valSubImpTot = this._utils.calculoLinea(idimpuesto, preciounit, cantidad, descuento);

        this.setImpuesto(phone, valSubImpTot);
      });

    phone.controls['total'].valueChanges
      .subscribe(data => {
        item = phone.value;
        item.total = data;
        const idimpuesto = item.idimpuesto;
        const total = item.total;
        const cantidad = item.cantidad;
        const descuento = item.descuento || null;
        const valSubImpTot = this._utils.calculoLineaT(idimpuesto, total, cantidad, descuento);

        this.setImpuesto(phone, valSubImpTot);
      });

    phone.controls['descuento'].valueChanges
      .subscribe(data => {
        item = phone.value;
        item.descuento = data;
        const idimpuesto = item.idimpuesto;
        const preciounit = item.preciounit;
        const cantidad = item.cantidad;
        const descuento = item.descuento || null;
        const valSubImpTot = this._utils.calculoLinea(idimpuesto, preciounit, cantidad, descuento);

        this.setImpuesto(phone, valSubImpTot);
      });

    phone.controls['bolsa'].valueChanges
      .subscribe(data => {
        item = phone.value;
        this.setImpuestoBolsa(phone, item.cantidad, data);
      });

    phone.controls['producto'].valueChanges
      .pipe(
        debounceTime(300),
        switchMap(data => {
          if (data && typeof data === 'string') {
            phone.controls['datalistloading'].setValue(true);
            const param = {
              page: 1,
              pageSize: 10,
              orderName: 'nombre',
              orderSort: 'asc'
            };

            param['likeNombre'] = data;
            return this._productoService.index(param);
          } else {
            phone.controls['datalistloading'].setValue(false);
            return [];
          }
        })
      )
      .subscribe((data: any) => {

        phone.controls['datalistloading'].setValue(false);

        while ((phone.controls['datalist'] as FormArray).length !== 0) {
          (phone.controls['datalist'] as FormArray).removeAt(0);
        }

        data.data.forEach(row => {
          (phone.controls['datalist'] as FormArray).push(new FormControl({
            idproducto: row.idproducto,
            codigo: row.codigo,
            nombre: row.nombre,
            precio: row.valorventa,
            unidadmedida: row.unidadmedida,
            codigosunat: row.codigosunat,
            idimpuesto: row.idimpuesto,
            stock: row.stock
          }));
        });
      });

    this.ventadet.push(phone);

    // Refresca cambios para el Autocomplete
    // setTimeout(() => {
    //   this.ventadet.at(this.ventadet.length - 1).get('producto').updateValueAndValidity();
    // }, 100);
  }

  setImpuesto(phone: any, valSubImpTot): void {
    phone.get('cantidad').setValue(valSubImpTot.cantidad, { emitEvent: false });
    phone.get('idimpuesto').setValue(valSubImpTot.idimpuesto, { emitEvent: false });
    phone.get('preciounit').setValue(valSubImpTot.preciounit, { emitEvent: false });
    phone.get('valorunit').setValue(valSubImpTot.valorunit, { emitEvent: false });
    phone.get('descuento').setValue(valSubImpTot.descuento, { emitEvent: false });
    phone.get('valorventa').setValue(valSubImpTot.subtotal, { emitEvent: false });
    phone.get('montototalimpuestos').setValue(valSubImpTot.montototalimpuestos, { emitEvent: false });
    phone.get('total').setValue(valSubImpTot.total, { emitEvent: false });
    this.calcularTotales();
  }

  setImpuestoBolsa(phone: any, cantidad: number, bolsa: boolean): void {
    if (bolsa) {
      cantidad = cantidad || 0;
      const impuestobolsa = this._utils.redondearValor(cantidad * 0.2, 3);
      phone.get('impuestobolsa').setValue(impuestobolsa, { emitEvent: false });
    } else {
      phone.get('impuestobolsa').setValue(null, { emitEvent: false });
    }
    this.calcularTotales();
  }

  deleteItem(index: number): void {
    this.ventadet.removeAt(index);
    this.calcularTotales();
  }

  displayProductoFn(item?): string | undefined {
    return item ? item.nombre : undefined;
  }

  modalGeneral(): void {
    const dialogRef = this._matDialog.open(MasivoGeneralComponent, {
      panelClass: 'masivogeneral-form-dialog',
      data: {
        venta: this.categoriaForm.getRawValue()
      },
      // autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log('response', response);
        this.categoriaForm.get('fechaemision').setValue(response.fechaemision);
        this.categoriaForm.get('fechavencimiento').setValue(response.fechavencimiento);
        this.categoriaForm.get('moneda').setValue(response.moneda);
        this.categoriaForm.get('tipocambio').setValue(response.tipocambio);
        this.categoriaForm.get('operacion').setValue(response.operacion);
        this.categoriaForm.get('pdfformato').setValue(response.pdfformato);
        this.categoriaForm.get('condicionpago').setValue(response.condicionpago);
        this.categoriaForm.get('observacion').setValue(response.observacion);
        this.categoriaForm.get('detraccion').setValue(response.detraccion);
        this.categoriaForm.get('selvaproducto').setValue(response.selvaproducto);
        this.categoriaForm.get('selvaservicio').setValue(response.selvaservicio);

        this.categoriaForm.get('idcliente').setValue(response.idcliente);
        this.categoriaForm.get('clientenombre').setValue(response.clientenombre);
        this.categoriaForm.get('clientedoc').setValue(response.clientedoc);
        this.categoriaForm.get('clientenumerodoc').setValue(response.clientenumerodoc);
        this.categoriaForm.get('clientedireccion').setValue(response.clientedireccion);
        // param
      });
  }

  calcularTotales(): void {
    console.log('calcularTotales()');
    let gravada = 0;
    let exonerada = 0;
    let inafecta = 0;
    let gratuita = 0;
    let descuentoItem = 0;
    let descuentoTotal = 0;
    let descuentoGlobal = 0;
    let totalImpuestoBolsa = 0;
    let igvItem = 0;
    let total = 0;

    const cargos = this.categoriaForm.get('cargo').value || 0;
    const descuentoporcentaje = this.categoriaForm.get('descuentoporcentaje').value;
    const detalle = this.ventadet.getRawValue();

    detalle.forEach(row => {
      if (row.total !== null) {
        descuentoItem += row.descuento;
        totalImpuestoBolsa += (row.impuestobolsa || 0);

        if (row.idimpuesto === 1) { // Gravado
          gravada += row.valorventa;
          igvItem += row.montototalimpuestos;
        }

        if (row.idimpuesto === 8) { // Exonerado
          exonerada += row.total;
        }

        if (row.idimpuesto === 9) { // Inafecto
          inafecta += row.total;
        }

        if (row.idimpuesto === 2) { // Gratuita
          gratuita += row.total;
        }
      }
    });

    if (descuentoporcentaje > 0) {
      let valorDscto: any;

      let tipodscto: string;
      tipodscto = 'porcentaje'; // porcentaje | valor

      if (tipodscto === 'porcentaje') {
        valorDscto = descuentoporcentaje / 100;
        console.log('valorDscto', valorDscto);
      }

      if (tipodscto === 'valor') {
        let divisor = this._utils.redondearValor(gravada + igvItem + exonerada + inafecta, 2);
        divisor = divisor === 0 ? 1 : divisor;
        valorDscto = descuentoporcentaje / divisor;
        console.log('valorDscto', valorDscto);
      }

      // Sumatoria descuento de "gravada", "exonerada" y "inafecta"
      const graexoina = gravada + exonerada + inafecta;
      descuentoGlobal = graexoina * valorDscto;
      descuentoGlobal = this._utils.redondearValor(descuentoGlobal, 2); // BD 2 decimales

      // Calculo descuento a "exonerada" y "inafecta"
      exonerada -= (exonerada * valorDscto);
      exonerada = this._utils.redondearValor(exonerada, 2); // BD 2 decimales

      inafecta -= (inafecta * valorDscto);
      inafecta = this._utils.redondearValor(inafecta, 2); // BD 2 decimales

      // Calculo descuento a "gravada" y "igvItem"
      let tmpGravadaIgv = gravada + igvItem;
      tmpGravadaIgv -= (tmpGravadaIgv * valorDscto);
      tmpGravadaIgv = this._utils.redondearValor(tmpGravadaIgv, 2);
      const tmpgravada = tmpGravadaIgv / 1.18;
      const tmpigv = tmpgravada * 0.18;

      gravada = this._utils.redondearValor(tmpgravada, 2); // BD 2 decimales
      igvItem = this._utils.redondearValor(tmpigv, 2); // BD 2 decimales
    }

    descuentoTotal = this._utils.redondearValor(descuentoItem + descuentoGlobal, 2); // BD 2 decimales = 3 decimales + 2 decimaes
    total = this._utils.redondearValor(gravada + igvItem + exonerada + inafecta + cargos + totalImpuestoBolsa, 2); // BD 2 decimales
    console.log(gravada, igvItem, exonerada, inafecta, cargos, totalImpuestoBolsa);
    console.log('total', total);

    this.categoriaForm.get('descuentoglobal').setValue(descuentoGlobal); // Suma descuento de "gravada", "exonerada" y "inafecta"
    this.categoriaForm.get('exonerada').setValue(exonerada);
    this.categoriaForm.get('inafecta').setValue(inafecta);
    this.categoriaForm.get('gratuita').setValue(gratuita);
    this.categoriaForm.get('gravada').setValue(gravada);
    this.categoriaForm.get('descuentoitem').setValue(descuentoItem);
    this.categoriaForm.get('descuentototal').setValue(descuentoTotal); // Descuento global + Descuento por ítem
    this.categoriaForm.get('valorimpuesto').setValue(igvItem);
    this.categoriaForm.get('totalimpuestobolsa').setValue(totalImpuestoBolsa);
    this.categoriaForm.get('total').setValue(total);
  }

  save(): void | boolean {
    let param: any;
    param = this.categoriaForm.getRawValue();

    // Validar cliente
    if (!param.idcliente) {
      this.snackBar.open('Ingrese cliente', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

    // Validar items
    let inValid = true;
    param.masivodet.forEach(item => {
      if (item.producto && item.producto.idproducto) {
        inValid = false;
      }
    });

    if (inValid) {
      this.snackBar.open('Ingrese producto para la venta', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

    const ventadet = [];
    param.masivodet.forEach(item => {
      if (item.producto && item.producto.idproducto) {
        const detitem = {
          cantidad: item.cantidad,
          codigo: item.producto.codigo,
          codigosunat: item.producto.codigosunat,
          descripcion: item.descripcion,
          descuento: item.descuento,
          idimpuesto: item.idimpuesto,
          idproducto: item.producto.idproducto,
          impuestobolsa: item.impuestobolsa,
          montototalimpuestos: item.montototalimpuestos,
          nombre: item.producto.nombre,
          preciounit: item.preciounit,
          total: item.total,
          unidadmedida: item.producto.unidadmedida,
          valorunit: item.valorunit,
          valorventa: item.valorventa
        };
        ventadet.push(detitem);
      }
    });

    param.masivodet = ventadet;
    param.fechaemision = this.pipeDate.transform(param.fechaemision, 'yyyy-MM-dd');
    param.fechavencimiento = param.fechavencimiento ? this.pipeDate.transform(param.fechavencimiento, 'yyyy-MM-dd') : null;
    param.detraccion = param.detraccion ? '1' : '0';
    param.selvaproducto = param.selvaproducto ? '1' : '0';
    param.selvaservicio = param.selvaservicio ? '1' : '0';

    this.submitted = true;
    const segundos = this._utils.redondearValor(0.3 * param.cantidad, 0); // 0.3s por CPE
    this.countdown = { leftTime: segundos };
    console.log('segundos', segundos);
    this._masivoService.create(param).subscribe((data) => {
      this.snackBar.open(`Ventas por lote emitidos.`, 'Cerrar');
      this.matDialogRef.close(data.data);
    }, error => {
      const message = this._utils.convertError(error);
      this.submitted = false;
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  openAddList(item, content: TemplateRef<any>, origin: HTMLElement) {
    this.popover.open({
      content,
      origin,
      position: [
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top'
        },
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        },
      ]
    });
  }
}
