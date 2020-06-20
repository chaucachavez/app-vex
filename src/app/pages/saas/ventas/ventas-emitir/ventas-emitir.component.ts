import { Component, OnInit, Inject, ViewEncapsulation, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize, startWith } from 'rxjs/operators';
import { VentasGeneralComponent } from '../ventas-general/ventas-general.component';
import { VentasGuiaComponent } from '../ventas-guia/ventas-guia.component';
import { VentasFormatoComponent } from '../ventas-formato/ventas-formato.component';
import { VentasItemComponent } from '../ventas-item/ventas-item.component';
import { ActivatedRoute } from '@angular/router';
import { VentasMediopagoComponent } from '../ventas-mediopago/ventas-mediopago.component';
import { VentasNotacreditoComponent } from '../ventas-notacredito/ventas-notacredito.component';
import { DataInicial } from 'src/app/services/datainicial';
import { Utils } from 'src/app/services/utils';
import { ProductoService } from 'src/app/services/producto.service';
import { DocumentoserieService } from 'src/app/services/documentoserie.service';
import { EntidadService } from 'src/app/services/entidad.service';
import { VentaService } from 'src/app/services/venta.service';
import { ContactoFormComponent } from 'src/app/components/contacto/contacto-form/contacto-form.component';
import { ItemFormComponent } from 'src/app/components/item/item-form/item-form.component';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icSettings from '@iconify/icons-ic/twotone-settings';
import icInsertDriveFile from '@iconify/icons-ic/twotone-insert-drive-file';
import icArrowBack from '@iconify/icons-ic/twotone-arrow-back';
import icSend from '@iconify/icons-ic/twotone-send';
import icSave from '@iconify/icons-ic/twotone-save';
import icPrint from '@iconify/icons-ic/twotone-print';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icDomain from '@iconify/icons-ic/twotone-domain';
import icAccountCircle from '@iconify/icons-ic/twotone-account-circle';
import { PopoverService } from 'src/@vex/components/popover/popover.service';
import { VentaShowComponent } from 'src/app/components/venta/venta-show/venta-show.component';
import { VentasAnularComponent } from 'src/app/components/venta/ventas-anular/ventas-anular.component';
import { VentasCorreoComponent } from 'src/app/components/venta/ventas-correo/ventas-correo.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'vex-ventas-emitir',
  templateUrl: './ventas-emitir.component.html',
  styleUrls: ['./ventas-emitir.component.scss'],
  encapsulation: ViewEncapsulation.None // Si comento no aplica el
})
export class VentasEmitirComponent implements OnInit {

  // Formulario
  ventaForm: FormGroup;
  submitted = false;
  settings: any;
  paramRoute = null;
  ventaNcNd = null;
  pipeDate = new DatePipe('es-Pe');

  // Comprobante
  comprobante = new FormControl(null, [Validators.required]);
  comprobantedefault: number;
  comprobantes: any[] = [];

  // Buscador cliente
  cliente = new FormControl(null, [Validators.required]);
  searchResult: any = { data: [], to: null, total: null };
  isLoadingSearch = false;

  // Data inicial y listados
  tiponc: any[] = this._datainicial.tiponc;
  monedas: any[] = this._datainicial.monedas;
  impuestos: any[] = this._datainicial.impuestos;
  operaciones: any[] = this._datainicial.operaciones;
  comprobantenc: any[] = this._datainicial.comprobantenc;

  // Iconos
  icAdd = icAdd;
  icEdit = icEdit;
  icSend = icSend;
  icSave = icSave;
  icPrint = icPrint;
  icClose = icClose;
  icSearch = icSearch;
  icDelete = icDelete;
  icDomain = icDomain;
  icMoreVert = icMoreVert;
  icSettings = icSettings;
  icArrowBack = icArrowBack;
  icAccountCircle = icAccountCircle;
  icInsertDriveFile = icInsertDriveFile;

  // Leyenda
  leyenda = {
    exonerada: false,
    inafecta: false,
    gratuita: false,
    icpber: false
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private _matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private _entidadService: EntidadService,
    private _ventaService: VentaService,
    private _documentoserieService: DocumentoserieService,
    private _productoService: ProductoService,
    private _utils: Utils,
    private _datainicial: DataInicial,
    private popover: PopoverService
  ) {
    this.settings = this._entidadService.settings;
    this.ventaForm = this.createForm();
  }

  ngOnInit(): void {

    if (this.settings.mediopago) {
      this.ventaForm.addControl('ventapago', new FormArray([], [Validators.required]));
    }

    this.activatedRoute.params.subscribe(value => {

      this.resetForm();

      this.paramRoute = value;

      // Comprobante por defecto
      if (this.paramRoute.comprobante) {
        switch (this.paramRoute.comprobante.toUpperCase()) {
          case 'FACTURA':
            this.comprobantedefault = 1;
            break;
          case 'BOLETADEVENTA':
            this.comprobantedefault = 2;
            break;
          case 'NOTADECREDITO':
            this.comprobantedefault = 13;
            break;
          case 'NOTADEDEBITO':
            this.comprobantedefault = 10;
            break;
        }
      }

      let itemSelected = null;
      this.comprobantes.forEach(item => {
        if (item.iddocumentofiscal === this.comprobantedefault) {
          itemSelected = item;
        }
      });

      console.log('itemSelected', itemSelected);
      if (itemSelected) {
        this.comprobante.setValue(itemSelected);
      }

      // Consulta venta para NC y ND
      if (this.paramRoute.venta) {
        this.show();
      }
    });

    this.cliente.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingSearch = true),
        switchMap(data => {
          if (typeof data === 'string') {
            this.ventaForm.get('idcliente').setValue(null);
            this.ventaForm.get('cpecorreo').setValue(null);
            this.ventaForm.get('clientenombre').setValue(null);
            this.ventaForm.get('clientedoc').setValue(null);
            this.ventaForm.get('clientenumerodoc').setValue(null, { emitEvent: false });
            this.ventaForm.get('clientedireccion').setValue(null);
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

    this.comprobante.valueChanges
      .subscribe(data => {
        if (data && data.iddocumentofiscal) {
          console.log('--->', data.iddocumentofiscal, data.serie);
          this.ventaForm.get('iddocumentofiscal').setValue(data.iddocumentofiscal);
          this.ventaForm.get('serie').setValue(data.serie);
          this.ventaForm.get('numero').setValue(data.numero);

          if (data.iddocumentofiscal === 13 || data.iddocumentofiscal === 10) {
            this.ventaForm.get('tiponc').setValue(1);
            if (this.ventaNcNd && this.ventaNcNd.serie === data.serie) {
              this.ventaForm.get('documentonc').setValue(this.ventaNcNd.iddocumentofiscal);
              this.ventaForm.get('serienc').setValue(this.ventaNcNd.serie);
              this.ventaForm.get('numeronc').setValue(this.ventaNcNd.numero);
            } else {
              this.ventaForm.get('documentonc').setValue(null);
              this.ventaForm.get('serienc').setValue(null);
              this.ventaForm.get('numeronc').setValue(null);
            }
          } else {
            this.ventaForm.get('tiponc').setValue(null);
            this.ventaForm.get('documentonc').setValue(null);
            this.ventaForm.get('serienc').setValue(null);
            this.ventaForm.get('numeronc').setValue(null);
          }
        } else {
          console.log('-vacio->');
          this.ventaForm.get('iddocumentofiscal').setValue(null);
          this.ventaForm.get('serie').setValue(null);
          this.ventaForm.get('numero').setValue(null);
          this.ventaForm.get('tiponc').setValue(null);
          this.ventaForm.get('documentonc').setValue(null);
          this.ventaForm.get('serienc').setValue(null);
          this.ventaForm.get('numeronc').setValue(null);
        }
      });

    this.ventaForm.get('ventadet').valueChanges.subscribe((data) => {
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

    this.ventaForm.get('clientenumerodoc').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(data => {
          if (typeof data === 'string' && (data.length === 8 || data.length === 11)) {
            const param = {
              page: 1,
              pageSize: 10,
              orderName: 'entidad',
              orderSort: 'asc'
            };
            param['numerodoc'] = data;
            return this._entidadService.index(param);
          } else {
            return [];
          }
        })
      )
      .subscribe((data: any) => {
        if (data.data.length) {
          const cliente = data.data[0];
          this.ventaForm.get('idcliente').setValue(cliente.identidad);
          this.ventaForm.get('cpecorreo').setValue(cliente.email);
          this.ventaForm.get('clientenombre').setValue(cliente.entidad);
          this.ventaForm.get('clientedoc').setValue(cliente.iddocumento);
          this.ventaForm.get('clientenumerodoc').setValue(cliente.numerodoc, { emitEvent: false });
          this.ventaForm.get('clientedireccion').setValue(cliente.direccion);

          this.cliente.setValue(cliente, { emitEvent: false });
          this.searchResult = data;
        }
      });

    this.ventaForm.get('cargo').valueChanges
      .subscribe(value => {
        value = this._utils.redondearValor(value, 2);
        this.ventaForm.get('cargo').setValue(value, { emitEvent: false });
        this.calcularTotales();
      });

    this.ventaForm.get('descuentoporcentaje').valueChanges
      .subscribe(value => {
        value = this._utils.redondearValor(value, 2);
        this.ventaForm.get('descuentoporcentaje').setValue(value, { emitEvent: false });
        this.calcularTotales();
      });

    this.indexDocumentoseries();

    if (!this.paramRoute.venta) {
      this.addItem();
      this.addItem();
      this.addItem();
    }
  }

  show(): void {
    this._ventaService.show(this.paramRoute.venta, { conRecurso: 'ventadet.producto,cliente,ventapago' })
      .subscribe(data => {
        this.inicializarCliente(data.data);
        this.inicializarVenta(data.data);
      }, (error) => {
        console.log(error);
      });
  }

  createForm(): FormGroup {
    return new FormGroup({
      // idventa: new FormControl(null),
      idsede: new FormControl(this._entidadService.sedeDefault || null),
      iddocumentofiscal: new FormControl(null),
      serie: new FormControl(null),
      numero: new FormControl(null),
      idcliente: new FormControl(null),
      fechaemision: new FormControl(new Date(), [Validators.required]),
      fechavencimiento: new FormControl(new Date()),
      idestadodocumento: new FormControl(27, [Validators.required]),
      cpecorreo: new FormControl(null),
      clientenombre: new FormControl(null),
      clientedoc: new FormControl(null),
      clientenumerodoc: new FormControl(null),
      clientedireccion: new FormControl(null),
      operacion: new FormControl(1, [Validators.required]),
      moneda: new FormControl('PEN', [Validators.required]),
      tipocambio: new FormControl(null),
      detraccion: new FormControl(false),
      selvaproducto: new FormControl(false),
      selvaservicio: new FormControl(false),
      placavehiculo: new FormControl(null),
      ordencompra: new FormControl(null),
      guiaremitente: new FormControl(null),
      guiatransportista: new FormControl(null),
      exonerada: new FormControl(null),
      inafecta: new FormControl(null),
      gratuita: new FormControl(null),
      gravada: new FormControl(null, [Validators.required]),
      valorimpuesto: new FormControl(null, [Validators.required]),
      total: new FormControl(null, [Validators.required]),
      pagado: new FormControl(null),
      vuelto: new FormControl(null),
      condicionpago: new FormControl(null),
      pdfformato: new FormControl('A4'),
      observacion: new FormControl(null),
      ventadet: new FormArray([], [Validators.required]),
      tiponc: new FormControl(null),
      documentonc: new FormControl(null),
      serienc: new FormControl(null),
      numeronc: new FormControl(null),
      descuentoporcentaje: new FormControl(null, [Validators.min(0)]),
      descuentoglobal: new FormControl(null),
      descuentoitem: new FormControl(null),
      descuentototal: new FormControl(null),
      cargo: new FormControl(null, [Validators.min(0)]),
      totalimpuestobolsa: new FormControl(null)
    });
  }

  inicializarCliente(data): void {
    const cliente = {
      identidad: data.cliente.identidad,
      email: data.cliente.email,
      entidad: data.cliente.entidad,
      iddocumento: data.cliente.iddocumento,
      numerodoc: data.cliente.numerodoc,
      direccion: data.cliente.direccion
    };

    this.cliente.setValue(cliente);
    this.cliente.updateValueAndValidity();
    this.autocompletadoClienteSelected(cliente);

    this.searchResult.data.push(cliente);
    this.searchResult.to += 1;
    this.searchResult.total += 1;
  }

  inicializarVenta(data): void {
    console.log('PRIMERO inicializarVenta()');
    this.ventaNcNd = data;

    // Setear venta
    this.ventaForm.get('idsede').setValue(data.idsede);
    this.ventaForm.get('operacion').setValue(data.operacion);
    this.ventaForm.get('pdfformato').setValue(data.pdfformato);
    this.ventaForm.get('moneda').setValue(data.moneda);
    this.ventaForm.get('selvaproducto').setValue(data.selvaproducto === '1' ? true : false);
    this.ventaForm.get('selvaservicio').setValue(data.selvaservicio === '1' ? true : false);

    if (this.comprobantedefault === 13 || this.comprobantedefault === 10) { // Nota de crédito/debito
      this.ventaForm.get('tiponc').setValue(1); // Anulacion de la operacion
      this.ventaForm.get('documentonc').setValue(data.iddocumentofiscal);
      this.ventaForm.get('serienc').setValue(data.serie);
      this.ventaForm.get('numeronc').setValue(data.numero);
    }

    data.ventadet.forEach((row: any) => {
      const producto = {
        idproducto: row.producto.idproducto,
        codigo: row.producto.codigo,
        nombre: row.producto.nombre,
        precio: parseFloat(row.preciounit),
        unidadmedida: row.producto.unidadmedida,
        codigosunat: row.producto.codigosunat,
        idimpuesto: row.idimpuesto,
        stock: null
      };

      const item = {
        producto,
        descripcion: row.descripcion,
        idimpuesto: row.idimpuesto,
        cantidad: parseFloat(row.cantidad),
        valorunit: parseFloat(row.valorunit),
        descuento: parseFloat(row.descuento),
        valorventa: parseFloat(row.valorventa),
        impuestobolsa: parseFloat(row.impuestobolsa),
        montototalimpuestos: parseFloat(row.montototalimpuestos),
        preciounit: parseFloat(row.preciounit),
        total: parseFloat(row.total),
        bolsa: parseFloat(row.impuestobolsa) > 0 ? true : false,
        datalist: [
          new FormControl(producto)
        ]
      };
      // console.log('item =>', item);
      this.addItem(item);
    });

    // data.ventapago.forEach(valor => {
    //   const phone = new FormGroup({
    //     idmediopago: new FormControl(valor.idmediopago),
    //     importe: new FormControl(valor.importe),
    //     nota: new FormControl(valor.nota),
    //   });
    //   this.ventapago.push(phone);
    // });

    this.calcularTotales();

    // Comprobante por defecto
    let itemSelected = null;
    this.comprobantes.forEach(item => {
      // Se trata de NC/ND entonces seteamos la serie perteneciente
      if (item.iddocumentofiscal === this.comprobantedefault && this.ventaNcNd && item.serie === this.ventaNcNd.serie) {
        itemSelected = item;
      }
    });

    if (itemSelected) {
      // console.log('NC ND', itemSelected);
      // this.comprobante.setValue(itemSelected, { emitEvent: false });
      this.comprobante.setValue(itemSelected);
    }
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

    const cargos = this.ventaForm.get('cargo').value || 0;
    const descuentoporcentaje = this.ventaForm.get('descuentoporcentaje').value;
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
      }

      if (tipodscto === 'valor') {
        let divisor = this._utils.redondearValor(gravada + igvItem + exonerada + inafecta, 2);
        divisor = divisor === 0 ? 1 : divisor;
        valorDscto = descuentoporcentaje / divisor;
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
    // console.log(gravada, igvItem, exonerada, inafecta, cargos, totalImpuestoBolsa);

    this.ventaForm.get('descuentoglobal').setValue(descuentoGlobal); // Suma descuento de "gravada", "exonerada" y "inafecta"
    this.ventaForm.get('exonerada').setValue(exonerada);
    this.ventaForm.get('inafecta').setValue(inafecta);
    this.ventaForm.get('gratuita').setValue(gratuita);
    this.ventaForm.get('gravada').setValue(gravada);
    this.ventaForm.get('descuentoitem').setValue(descuentoItem);
    this.ventaForm.get('descuentototal').setValue(descuentoTotal); // Descuento global + Descuento por ítem
    this.ventaForm.get('valorimpuesto').setValue(igvItem);
    this.ventaForm.get('totalimpuestobolsa').setValue(totalImpuestoBolsa);
    this.ventaForm.get('total').setValue(total);
  }

  get ventadet(): FormArray {
    return this.ventaForm.get('ventadet') as FormArray;
  }

  get ventapago(): FormArray {
    return this.ventaForm.get('ventapago') as FormArray;
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

  autocompletadoClienteSelected(data: any): void {
    if (data) {
      this.ventaForm.get('idcliente').setValue(data.identidad);
      this.ventaForm.get('cpecorreo').setValue(data.email);
      this.ventaForm.get('clientenombre').setValue(data.entidad);
      this.ventaForm.get('clientedoc').setValue(data.iddocumento);
      this.ventaForm.get('clientenumerodoc').setValue(data.numerodoc, { emitEvent: false });
      this.ventaForm.get('clientedireccion').setValue(data.direccion);
    }
  }

  addItem(item?: any, replace?: number): void | boolean {

    const phone = new FormGroup({
      producto: new FormControl(item ? item.producto : null),
      descripcion: new FormControl(item ? item.descripcion : null),
      cantidad: new FormControl(item ? item.cantidad : null), // , disabled
      valorunit: new FormControl(item ? item.valorunit : null),
      descuento: new FormControl(item ? item.descuento : null),
      valorventa: new FormControl({ value: item ? item.valorventa : null, disabled: true }),
      impuestobolsa: new FormControl({ value: item ? item.impuestobolsa : null, disabled: true }),
      idimpuesto: new FormControl(item ? item.idimpuesto : 1), // , IGV
      montototalimpuestos: new FormControl({ value: item ? item.montototalimpuestos : null, disabled: true }),
      preciounit: new FormControl(item ? item.preciounit : null), // , disabled
      total: new FormControl(item ? item.total : null), // , disabled
      bolsa: new FormControl(item ? item.bolsa : false),
      datalist: new FormArray(item ? item.datalist : []),
      datalistloading: new FormControl(false) // loading de buscador
    });

    // Detección de cambio en toda la FILA
    // phone.valueChanges.subscribe(data => {
    //   console.log('================>', data);
    // });
    phone.get('idimpuesto').valueChanges
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

    phone.get('preciounit').valueChanges
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

    phone.get('cantidad').valueChanges
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

    phone.get('descuento').valueChanges
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

    phone.get('total').valueChanges
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

    phone.get('bolsa').valueChanges
      .subscribe(data => {
        item = phone.value;
        this.setImpuestoBolsa(phone, item.cantidad, data);
      });

    phone.get('producto').valueChanges
      .pipe(
        debounceTime(300),
        switchMap(data => {
          if (data && typeof data === 'string') {
            phone.get('datalistloading').setValue(true);
            const param = {
              page: 1,
              pageSize: 10,
              orderName: 'nombre',
              orderSort: 'asc'
            };

            param['likeNombre'] = data;
            return this._productoService.index(param);
          } else {
            phone.get('datalistloading').setValue(false);
            return [];
          }
        })
      )
      .subscribe((data: any) => {

        phone.get('datalistloading').setValue(false);

        (phone.get('datalist') as FormArray).clear();

        data.data.forEach(row => {
          (phone.get('datalist') as FormArray).push(new FormControl({
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

    if (typeof replace === 'undefined') {
      this.ventadet.push(phone);
    } else {
      this.ventadet.setControl(replace, phone);
    }

    this.calcularTotales();
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

  displaySearchEntidad(item?: any): string | null {
    return item ? item.entidad : null;
  }

  displayProductoFn(item?: any): string | undefined {
    // console.log('item.nombre', item.nombre);
    return item ? item.nombre : undefined;
  }

  newEntidad(): void {

    let numerodoc: string = null;

    // if (typeof this.cliente.value === 'string' && this.cliente.value) {
    if (typeof this.cliente.value === 'string' && /^[0-9]+$/.exec(this.cliente.value.trim())) {
      numerodoc = this.cliente.value.trim();
    }
    // }

    const dialogRef = this._matDialog.open(ContactoFormComponent, {
      panelClass: 'contacto-form-dialog',
      data: {
        action: 'new',
        dialogTitle: 'Nuevo cliente',
        tipo: 'cliente',
        numerodoc
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }

        const cliente = {
          identidad: response.identidad,
          email: response.email,
          entidad: response.entidad,
          iddocumento: response.iddocumento,
          numerodoc: response.numerodoc,
          direccion: response.direccion
        };

        this.cliente.setValue(cliente);
        this.cliente.updateValueAndValidity();
        this.autocompletadoClienteSelected(cliente);

        this.searchResult.data.push(cliente);
        this.searchResult.to += 1;
        this.searchResult.total += 1;
      });
  }

  newProducto(): void {
    const dialogRef = this._matDialog.open(ItemFormComponent, {
      panelClass: 'item-form-dialog',
      data: {
        action: 'new',
        dialogTitle: 'Nuevo producto'
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }

        // Buscamos indice
        let index: any;
        for (const [i, row] of this.ventadet.value.entries()) {
          if (!(row.producto && row.producto.idproducto)) {
            index = i;
            break;
          }
        }

        const producto = {
          idproducto: response.idproducto,
          codigo: response.codigo,
          nombre: response.nombre,
          precio: response.valorventa,
          unidadmedida: response.unidadmedida,
          codigosunat: response.codigosunat,
          idimpuesto: response.idimpuesto,
          stock: null
        };

        const valSubImpTot = this._utils.calculoLinea(response.idimpuesto, response.valorventa, 1);
        const item = {
          producto,
          descripcion: null,
          idimpuesto: response.idimpuesto,
          cantidad: 1,
          valorunit: valSubImpTot.valorunit,
          descuento: valSubImpTot.descuento,
          valorventa: valSubImpTot.subtotal,
          montototalimpuestos: valSubImpTot.montototalimpuestos,
          preciounit: valSubImpTot.preciounit,
          total: valSubImpTot.total,
          bolsa: valSubImpTot.impuestobolsa > 0 ? true : false,
          datalist: [
            new FormControl(producto)
          ]
        };

        this.addItem(item, index);
      });
  }

  modalGeneral(): void {
    const dialogRef = this._matDialog.open(VentasGeneralComponent, {
      panelClass: 'ventasgeneral-form-dialog',
      data: {
        venta: this.ventaForm.getRawValue()
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }

        this.ventaForm.get('fechavencimiento').setValue(response.fechavencimiento);
        this.ventaForm.get('operacion').setValue(response.operacion);
        this.ventaForm.get('placavehiculo').setValue(response.placavehiculo);
        this.ventaForm.get('ordencompra').setValue(response.ordencompra);
        this.ventaForm.get('guiaremitente').setValue(response.guiaremitente);
        this.ventaForm.get('guiatransportista').setValue(response.guiatransportista);
        this.ventaForm.get('tipocambio').setValue(response.tipocambio);
        this.ventaForm.get('pdfformato').setValue(response.pdfformato);
        this.ventaForm.get('detraccion').setValue(response.detraccion);
        this.ventaForm.get('selvaproducto').setValue(response.selvaproducto);
        this.ventaForm.get('selvaservicio').setValue(response.selvaservicio);
      });
  }

  modalNotacredito(): void {
    const dialogRef = this._matDialog.open(VentasNotacreditoComponent, {
      panelClass: 'ventasnotacredito-form-dialog',
      data: this.ventaForm.getRawValue(),
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }

        this.ventaForm.get('tiponc').setValue(response.tiponc);
        this.ventaForm.get('documentonc').setValue(response.documentonc);
        this.ventaForm.get('serienc').setValue(response.serienc);
        this.ventaForm.get('numeronc').setValue(response.numeronc);

        // Comprobante por defecto
        let itemSelected = null;
        this.comprobantes.forEach(item => {
          if ((item.iddocumentofiscal === 13 || item.iddocumentofiscal === 10) && item.serie === response.serienc) {
            itemSelected = item;
          }
        });

        // Caso sea B/F física
        if (response.serienc.substr(0, 1) === '0') {
          this.comprobantes.forEach(item => {
            const caracter = response.documentonc === 1 ? 'F' : 'B';
            if ((item.iddocumentofiscal === 13 || item.iddocumentofiscal === 10) && item.serie.substr(0, 1) === caracter) {
              itemSelected = item;
            }
          });
        }

        if (itemSelected) {
          this.comprobante.setValue(itemSelected, { emitEvent: false });
        }
      });
  }

  modalGuia(): void {
    const dialogRef = this._matDialog.open(VentasGuiaComponent, {
      panelClass: 'ventasguia-form-dialog',
      data: {
        venta: this.ventaForm
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
      });
  }

  modalFormato(): void {
    const dialogRef = this._matDialog.open(VentasFormatoComponent, {
      panelClass: 'ventasformato-form-dialog',
      data: {
        venta: this.ventaForm
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
      });
  }

  modalItem(row: any, index: number): void {
    const dialogRef = this._matDialog.open(VentasItemComponent, {
      panelClass: 'ventasitem-form-dialog',
      data: {
        item: row.getRawValue(),
        impuestos: this.impuestos
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }


        let existe = false;
        this.ventadet.value.forEach(item => {
          if (item.producto && item.producto.idproducto === response.producto.idproducto &&
            response.producto.idproducto !== row.get('producto').value.idproducto
          ) {
            existe = true;
          }
        });

        if (existe) {
          this.snackBar.open(`${response.producto.nombre} ya esta añadido.`, 'Cerrar', { duration: 4000, panelClass: ['error-dialog'] });
        } else {
          this.ventadet.at(index).get('idimpuesto').setValue(response.idimpuesto, { emitEvent: false });
          this.ventadet.at(index).get('producto').setValue(response.producto, { emitEvent: false });
          this.ventadet.at(index).get('descripcion').setValue(response.descripcion, { emitEvent: false });
          this.ventadet.at(index).get('cantidad').setValue(response.cantidad, { emitEvent: false });
          this.ventadet.at(index).get('preciounit').setValue(response.preciounit, { emitEvent: false });
          this.ventadet.at(index).get('valorunit').setValue(response.valorunit, { emitEvent: false });
          this.ventadet.at(index).get('descuento').setValue(response.descuento, { emitEvent: false });
          this.ventadet.at(index).get('valorventa').setValue(response.valorventa, { emitEvent: false });
          this.ventadet.at(index).get('montototalimpuestos').setValue(response.montototalimpuestos, { emitEvent: false });
          this.ventadet.at(index).get('total').setValue(response.total, { emitEvent: false });

          // Refresca cambios para el Autocomplete
          setTimeout(() => {
            row.get('producto').updateValueAndValidity();
          }, 100);

          this.calcularTotales();
        }
      });
  }

  indexDocumentoseries(): void {
    const param = {
      idsede: this._entidadService.sedeDefault,
      conRecurso: 'documentofiscal',
      orderName: 'iddocumentofiscal',
      orderSort: 'asc',
    };

    this._documentoserieService.index(param)
      .subscribe((data: any) => {
        console.log('PRIMERO indexDocumentoseries()');
        data.data.forEach(item => {
          this.comprobantes.push({
            iddocumentofiscal: item.iddocumentofiscal,
            documentofiscal: { nombre: item.documentofiscal.nombre },
            serie: item.serie,
            numero: item.numero
          });
        });

        // Comprobante por defecto
        let itemSelected = null;
        this.comprobantes.forEach(item => {
          // Su se trata de NC/ND entonces seteamos la serie perteneciente
          if (this.paramRoute.venta) {
            if (item.iddocumentofiscal === this.comprobantedefault && this.ventaNcNd && item.serie === this.ventaNcNd.serie) {
              itemSelected = item;
            }
          } else {
            if (item.iddocumentofiscal === this.comprobantedefault) {
              itemSelected = item;
            }
          }
        });

        if (itemSelected) {
          console.log('indexDocumentoseries', this.paramRoute.venta ? false : true);
          // this.comprobante.setValue(itemSelected, { emitEvent: this.paramRoute.venta ? false : true });
          this.comprobante.setValue(itemSelected);
        }

      });
  }

  modalMediopago(): void {

    const dialogRef = this._matDialog.open(VentasMediopagoComponent, {
      panelClass: 'ventasmediopago-form-dialog',
      data: {
        venta: this.ventaForm.getRawValue()
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }

        while (this.ventapago.value.length > 0) {
          this.ventapago.removeAt(0);
        }

        response.mediopago.forEach((item: any) => {
          const phone = new FormGroup({
            idmediopago: new FormControl(item.idmediopago),
            importe: new FormControl(item.importe),
            nota: new FormControl(item.nota)
          });

          this.ventapago.push(phone);
        });

        this.ventaForm.get('pagado').setValue(response.pagado);
        this.ventaForm.get('vuelto').setValue(response.vuelto);

        this.save();
      });
  }

  emitir(): void {

    let param: any;
    param = this.ventaForm.getRawValue();

    // Validar cliente
    if (!param.idcliente) {
      this.snackBar.open('Ingrese cliente', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

    // Validar items
    let inValid = true;
    param.ventadet.forEach(item => {
      if (item.producto && item.producto.idproducto) {
        inValid = false;
      }
    });

    if (inValid) {
      this.snackBar.open('Ingrese producto para la venta', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

    if (this.settings.mediopago) {
      this.modalMediopago();
    } else {
      this.save();
    }
  }

  resetCliente(): void {
    // this.cliente.reset();
    // this.ventaForm.reset();
    this.resetForm();
  }

  save(): void {
    let param: any;
    param = this.ventaForm.getRawValue();

    const ventadet = [];
    param.ventadet.forEach(item => {
      if (item.producto && item.producto.idproducto) {
        // item.idproducto = item.producto.idproducto;
        // item.nombre = item.producto.nombre;
        // item.codigo = item.producto.codigo;
        // item.unidadmedida = item.producto.unidadmedida;
        // item.codigosunat = item.producto.codigosunat;
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

    param.ventadet = ventadet;
    param.fechaemision = this.pipeDate.transform(param.fechaemision, 'yyyy-MM-dd');
    param.fechavencimiento = param.fechavencimiento ? this.pipeDate.transform(param.fechavencimiento, 'yyyy-MM-dd') : null;
    param.detraccion = param.detraccion ? '1' : '0';
    param.selvaproducto = param.selvaproducto ? '1' : '0';
    param.selvaservicio = param.selvaservicio ? '1' : '0';

    this.snackBar.open(`Procesando venta...`);

    this.submitted = true;
    this._ventaService.create(param).subscribe((data) => {
      this.indexDocumentoseries();
      // Mensaje
      let comprobante: string;
      switch (data.iddocumentofiscal) {
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

      this.resetForm();
      this.submitted = false;
      this.showVenta(data, 'COMPROBANTE');
      this.snackBar.open(`${comprobante} ${data.serie} - ${data.numero} emitido.`, 'Cerrar');
    }, error => {
      const message = this._utils.convertError(error);
      this.submitted = false;
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  resetForm(): void {
    // Comprobante
    let itemSelected = null;
    this.comprobantes.forEach(item => {
      if (item.iddocumentofiscal === this.comprobantedefault) {
        itemSelected = item;
      }
    });

    // Comprobante
    this.comprobante.reset(itemSelected, { emitEvent: false });

    // Cliente
    this.cliente.reset(null, { emitEvent: false });

    // Vacear array
    this.ventaForm.get('ventadet')['controls'].forEach((phone) => {
      while ((phone.controls['datalist'] as FormArray).length !== 0) {
        (phone.controls['datalist'] as FormArray).removeAt(0);
      }
    });

    // Venta detalle
    let n = 1;
    const detItems = [];
    while (n <= this.ventadet.value.length) {
      detItems.push({
        producto: null,
        descripcion: null,
        cantidad: null,
        valorunit: null,
        descuento: null,
        valorventa: null,
        impuestobolsa: null,
        idimpuesto: 1, // Gravado
        montototalimpuestos: null,
        preciounit: null,
        total: null,
        bolsa: false,
        datalist: [],
        datalistloading: false
      });
      n++;
    }

    const valueDefault = {
      comprobante: itemSelected,
      idsede: this._entidadService.sedeDefault || null,
      iddocumentofiscal: itemSelected ? itemSelected.iddocumentofiscal : null,
      serie: itemSelected ? itemSelected.serie : null,
      numero: itemSelected ? itemSelected.numero : null,
      fechaemision: new Date(),
      fechavencimiento: new Date(),
      idestadodocumento: 27, // 27: Emitido
      operacion: 1,
      moneda: 'PEN',
      detraccion: false,
      selvaproducto: false,
      selvaservicio: false,
      pdfformato: 'A4',
      ventadet: detItems,
      tiponc: itemSelected && itemSelected.iddocumentofiscal === 13 ? 1 : null
    };

    if (this.settings.mediopago) {
      valueDefault['ventapago'] = [];
    }

    this.ventaForm.reset(valueDefault, { emitEvent: false });

    this.leyenda = { exonerada: false, inafecta: false, gratuita: false, icpber: false };
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

  showVenta(venta, pestana?: string): void {
    const dialogRef = this._matDialog.open(VentaShowComponent, {
      panelClass: 'venta-show-dialog',
      data: {
        idventa: venta.idventa,
        pestana,
        botones: {
          canu: false, // consultar anulacion
          rpdf: false, // regenerar pdf
          nvent: true, // nueva venta
          edit: false, // editar
          anu: true, // anular
          mail: true, // enviar
          nc: false, // nota de credito
          nd: false, // nota de débito
          gr: false // guia de remision
        }
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (response === 'anular') {
          this.anularVenta(venta);
        }

        if (response === 'correo') {
          this.correoVenta(venta);
        }

        // if (response === 'Notadecredito') {
        //   this.nuevoComprobante(venta, 'Notadecredito');
        // }

        // if (response === 'Notadedebito') {
        //   this.nuevoComprobante(venta, 'Notadecredito');
        // }

        // if (response === 'regenerar') {
        //   this.regenerarPDF(venta);
        // }
      });
  }

  anularVenta(venta: any): void {
    const dialogRef = this._matDialog.open(VentasAnularComponent, {
      panelClass: 'ventasanular-form-dialog',
      data: {
        venta
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }
      });
  }

  correoVenta(venta: any): void {
    const dialogRef = this._matDialog.open(VentasCorreoComponent, {
      panelClass: 'ventascorreo-form-dialog',
      data: {
        venta
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }
      });
  }
}

export interface Producto {
  idproducto: number;
  codigo: string;
  nombre: string;
  precio: number;
  unidadmedida: string;
  codigosunat: string;
  idimpuesto: number;
}

export interface Cliente {
  identidad: number;
  entidad: string;
  numerodoc: string;
  sexo: string;
  direccion: string;
  email: string;
}
