import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { map, debounceTime, tap, switchMap, finalize, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { VALORUNIT_VENTA } from 'src/app/config/config';
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
import icDeleteSweep from '@iconify/icons-ic/twotone-delete-sweep';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'vex-ventas-form',
  templateUrl: './ventas-form.component.html',
  styleUrls: ['./ventas-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasFormComponent implements OnInit {

  ventaForm: FormGroup;
  pipeDate = new DatePipe('es-Pe');
  comprobantes: any[] = [];

  producto: FormControl = new FormControl('');
  filteredOptions: Observable<Producto[]>;

  comprobantenc: any[] = this._datainicial.comprobantenc;
  tiponc: any[] = this._datainicial.tiponc;
  monedas: any[] = this._datainicial.monedas;
  impuestos: any[] = this._datainicial.impuestos;

  searchResult: any = { data: [], to: null, total: null };
  isLoadingSearch = false;

  productos: Producto[] = [];
  filteredProductos: Observable<Producto[]>[] = [];

  submitted = false;

  icSearch = icSearch;
  icAdd = icAdd;
  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;
  icSettings = icSettings;
  icInsertDriveFile = icInsertDriveFile;
  icArrowBack = icArrowBack;
  icSend = icSend;
  icSave = icSave;
  icPrint = icPrint;
  icMoreVert = icMoreVert;
  icDeleteSweep = icDeleteSweep;

  iddocumentofiscalDefault: number;
  constructor(
    private activatedRoute: ActivatedRoute,
    private _matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private _entidadService: EntidadService,
    private _ventaService: VentaService,
    private _documentoserieService: DocumentoserieService,
    private _productoService: ProductoService,
    private _utils: Utils,
    private _datainicial: DataInicial
  ) {

  }

  ngOnInit(): void {
    this.ventaForm = this.createForm();

    this.activatedRoute.params.subscribe(value => {
      console.log('activatedRoute', value);
      if (value.comprobante) {
        switch (value.comprobante.toUpperCase()) {
          case 'FACTURA':
            this.iddocumentofiscalDefault = 1;
            break;
          case 'BOLETADEVENTA':
            this.iddocumentofiscalDefault = 2;
            break;
          case 'NOTADECREDITO':
            this.iddocumentofiscalDefault = 13;

            break;
          case 'NOTADEDEBITO':
            this.iddocumentofiscalDefault = 10;
            break;
        }
      }

      this.filteredOptions = this.producto.valueChanges
        .pipe(
          startWith(''),
          map(val => typeof val === 'string' ? val : val.nombre),
          map(name => name ? this._filterProductos(name) : this.productos.slice())
        );

      // Consulta venta para NC
      if (value.venta) {
        this._ventaService.show(value.venta, { conRecurso: 'ventadet.producto, cliente, ventapago' })
          .subscribe(data => {
            this.ventaForm.get('cliente').setValue({
              identidad: data.data.cliente.identidad,
              numerodoc: data.data.cliente.numerodoc,
              entidad: data.data.cliente.entidad,
              sexo: data.data.cliente.sexo
            });

            this.ventaForm.get('idventa').setValue(data.data.idventa);
            this.ventaForm.get('idsede').setValue(data.data.idsede);
            this.ventaForm.get('condicionpago').setValue(data.data.condicionpago);
            this.ventaForm.get('observacion').setValue(data.data.observacion);
            this.ventaForm.get('fechavencimiento').setValue(data.data.fechavencimiento);
            this.ventaForm.get('operacion').setValue(data.data.operacion);
            this.ventaForm.get('placavehiculo').setValue(data.data.placavehiculo);
            this.ventaForm.get('ordencompra').setValue(data.data.ordencompra);
            this.ventaForm.get('guiaremitente').setValue(data.data.guiaremitente);
            this.ventaForm.get('guiatransportista').setValue(data.data.guiatransportista);
            this.ventaForm.get('pdfformato').setValue(data.data.pdfformato);
            this.ventaForm.get('moneda').setValue(data.data.moneda);
            this.ventaForm.get('tipocambio').setValue(parseFloat(data.data.tipocambio));
            this.ventaForm.get('detraccion').setValue(data.data.detraccion === '1' ? true : false);
            this.ventaForm.get('selvaproducto').setValue(data.data.selvaproducto === '1' ? true : false);
            this.ventaForm.get('selvaservicio').setValue(data.data.selvaservicio === '1' ? true : false);
            this.ventaForm.get('pagado').setValue(parseFloat(data.data.pagado));
            this.ventaForm.get('vuelto').setValue(parseFloat(data.data.vuelto));

            if (this.iddocumentofiscalDefault === 13) { // Nota de crédito
              this.ventaForm.get('tiponc').setValue(1); // Anulacion de la operacion
              this.ventaForm.get('documentonc').setValue(data.data.iddocumentofiscal);
              this.ventaForm.get('serienc').setValue(data.data.serie);
              this.ventaForm.get('numeronc').setValue(data.data.numero);
            }

            data.data.ventadet.forEach(valor => {
              const valSubImpTot = this._utils.calculoLinea(valor.idimpuesto, parseFloat(valor.preciounit),
                valor.cantidad, parseFloat(valor.descuento));

              const item = {
                producto: {
                  idproducto: valor.producto.idproducto,
                  codigo: valor.producto.codigo,
                  nombre: valor.producto.nombre,
                  precio: valor.producto.precio,
                  unidadmedida: valor.producto.unidadmedida,
                  codigosunat: valor.producto.codigosunat,
                  idimpuesto: valor.idimpuesto
                },
                descripcion: valor.descripcion,
                idimpuesto: valor.idimpuesto,
                cantidad: valor.cantidad,
                valorunit: valSubImpTot.valorunit,
                descuento: parseFloat(valor.descuento),
                valorventa: valSubImpTot.subtotal,
                montototalimpuestos: valSubImpTot.montototalimpuestos,
                preciounit: parseFloat(valor.preciounit),
                total: valSubImpTot.total
              };
              // console.log('item =>', item);
              this.addItem(item);
            });

            data.data.ventapago.forEach(valor => {
              const phone = new FormGroup({
                idmediopago: new FormControl(valor.idmediopago),
                importe: new FormControl(valor.importe),
                nota: new FormControl(valor.nota),
              });
              this.ventapago.push(phone);
            });

          }, (error) => {
            console.log(error);
          });
      }

      // Comprobante por defecto
      let itemSelected = null;
      this.comprobantes.forEach(item => {
        if (item.iddocumentofiscal === this.iddocumentofiscalDefault) {
          itemSelected = item;
        }
      });

      console.log('itemSelected', itemSelected);
      if (itemSelected) {
        this.ventaForm.get('comprobante').setValue(itemSelected);
      }
    });

    this.ventaForm.get('ventadet').valueChanges.subscribe((changes) => {

      changes.forEach((item: any, index: number) => {
        // console.log(item.producto.idproducto, typeof item.producto === 'string', this.ventadet.at(index).dirty);
        // if (item.producto.idproducto) {
        if (typeof item.producto === 'object') {
          console.log('(1) valueChanges ' + index, item);
          const idimpuesto = item.idimpuesto || null;
          const preciounit = item.preciounit || null;
          const cantidad = item.cantidad || null;
          const descuento = item.descuento || null;

          const valSubImpTot = this._utils.calculoLinea(idimpuesto, preciounit, cantidad, descuento);

          this.ventadet.at(index).get('cantidad').setValue(cantidad, { emitEvent: false });
          this.ventadet.at(index).get('preciounit').setValue(preciounit, { emitEvent: false });
          this.ventadet.at(index).get('valorunit').setValue(valSubImpTot.valorunit, { emitEvent: false });
          this.ventadet.at(index).get('descuento').setValue(descuento, { emitEvent: false });
          this.ventadet.at(index).get('gravada').setValue(valSubImpTot.subtotal, { emitEvent: false });
          this.ventadet.at(index).get('montototalimpuestos').setValue(valSubImpTot.montototalimpuestos, { emitEvent: false });
          this.ventadet.at(index).get('total').setValue(valSubImpTot.total, { emitEvent: false });
          this.calcularTotales();
        }

        // if (typeof item.producto === 'string' && this.ventadet.at(index).dirty) {
        if (typeof item.producto === 'string') {
          console.log('(2) valueChanges ' + index);
          this.ventadet.at(index).get('cantidad').setValue('', { emitEvent: false });
          this.ventadet.at(index).get('cantidad').setValidators(null);
          this.ventadet.at(index).get('cantidad').disable({ emitEvent: false });
          this.ventadet.at(index).get('cantidad').updateValueAndValidity({ emitEvent: false });

          this.ventadet.at(index).get('preciounit').setValue('', { emitEvent: false });
          this.ventadet.at(index).get('preciounit').setValidators(null);
          this.ventadet.at(index).get('preciounit').disable({ emitEvent: false });
          this.ventadet.at(index).get('preciounit').updateValueAndValidity({ emitEvent: false });

          this.ventadet.at(index).get('valorunit').setValue('', { emitEvent: false });
          this.ventadet.at(index).get('descuento').setValue('', { emitEvent: false });
          this.ventadet.at(index).get('valorventa').setValue('', { emitEvent: false });
          this.ventadet.at(index).get('montototalimpuestos').setValue('', { emitEvent: false });

          this.ventadet.at(index).get('total').setValue('', { emitEvent: false });
          this.ventadet.at(index).get('total').setValidators(null);
          this.ventadet.at(index).get('total').disable({ emitEvent: false });
          this.ventadet.at(index).get('total').updateValueAndValidity({ emitEvent: false });

          this.calcularTotales();
        }
      });
    });

    this.ventaForm.controls['cliente'].valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingSearch = true),
        switchMap(data => {

          if (typeof data === 'object') {
            console.log('data =>', data);
            // this.ventaForm.get('numerodoc').setValue(data.numerodoc);
            this.ventaForm.get('idcliente').setValue(data.identidad);
            this.ventaForm.get('cpecorreo').setValue(data.email);

            this.ventaForm.get('clientenombre').setValue(data.entidad);
            this.ventaForm.get('clientedoc').setValue(data.clientedoc);
            this.ventaForm.get('clientenumerodoc').setValue(data.numerodoc);
            this.ventaForm.get('clientedireccion').setValue(data.direccion);
          } else {
            // this.ventaForm.get('numerodoc').setValue(null);
            this.ventaForm.get('idcliente').setValue(null);
            this.ventaForm.get('cpecorreo').setValue(null);

            this.ventaForm.get('clientenombre').setValue(null);
            this.ventaForm.get('clientedoc').setValue(null);
            this.ventaForm.get('clientenumerodoc').setValue(null);
            this.ventaForm.get('clientedireccion').setValue(null);
          }

          if (data && typeof data === 'string') {
            const param = {
              idempresa: this._entidadService.usuario.idempresa,
              page: 1,
              pageSize: 10,
              orderName: 'entidad',
              orderSort: 'asc'
              // conRecurso: 'documento'
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
        // this.searchResult = data;
        this.searchResult.to = data.to;
        this.searchResult.total = data.total;
        this.searchResult.data = [];

        data.data.forEach(item => {
          this.searchResult.data.push({
            identidad: item.identidad,
            entidad: item.entidad,
            numerodoc: item.numerodoc,
            sexo: item.sexo,
            direccion: item.direccion,
            email: item.email,
            clientedoc: item.iddocumento
          });
        });
      });

    this.ventaForm.controls['comprobante'].valueChanges
      .subscribe(data => {
        console.log('comprobante Subscribe', data);
        this.ventaForm.get('tiponc').setValue(null);
        this.ventaForm.get('documentonc').setValue(null);
        this.ventaForm.get('serienc').setValue(null);
        this.ventaForm.get('numeronc').setValue(null);

        if (data && data.iddocumentofiscal) {
          this.ventaForm.get('iddocumentofiscal').setValue(data.iddocumentofiscal);
          this.ventaForm.get('serie').setValue(data.serie);
          this.ventaForm.get('numero').setValue(data.numero);
          if (data.iddocumentofiscal === 13) {
            this.ventaForm.get('tiponc').setValue(1);
          }
        } else {
          this.ventaForm.get('iddocumentofiscal').setValue(null);
          this.ventaForm.get('serie').setValue(null);
          this.ventaForm.get('numero').setValue(null);
        }
      });

    this.ventaForm.controls['cargo'].valueChanges
      .subscribe(value => {
        this.calcularTotales();
      });

    this.ventaForm.controls['descuentoporcentaje'].valueChanges
      .subscribe(value => {
        this.calcularTotales();
      });

    this.indexDocumentoseries();
    this.indexProductos();

    // Mejor cuando carga los productos, asi el listado de autocompletable se despliega
    // this.addItem();
  }

  resetForm(): void {
    // Comprobante
    let itemSelected = null;
    this.comprobantes.forEach(item => {
      if (item.iddocumentofiscal === this.iddocumentofiscalDefault) {
        itemSelected = item;
      }
    });

    // Venta detalle
    let n = 1;
    const detItems = [];
    while (n <= this.ventadet.value.length) {
      detItems.push({
        idimpuesto: 1
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
      idestadodocumento: 27,
      operacion: 1,
      moneda: 'PEN',
      detraccion: false,
      selvaproducto: false,
      selvaservicio: false,
      pdfformato: 'A4',
      ventadet: detItems,
      tiponc: itemSelected && itemSelected.iddocumentofiscal === 13 ? 1 : null
    };
    this.ventaForm.reset(valueDefault, { emitEvent: false });
  }

  createForm(): FormGroup {
    return new FormGroup({
      idventa: new FormControl(null),
      comprobante: new FormControl(null, [Validators.required]),
      idsede: new FormControl(this._entidadService.sedeDefault || null),
      iddocumentofiscal: new FormControl(null),
      serie: new FormControl(null),
      numero: new FormControl(null),
      idcliente: new FormControl(null),
      fechaemision: new FormControl(new Date(), [Validators.required]),
      fechavencimiento: new FormControl(new Date(), [Validators.required]),
      idestadodocumento: new FormControl(27, [Validators.required]),
      cliente: new FormControl(null, [Validators.required]),
      cpecorreo: new FormControl(null),
      clientenombre: new FormControl(null),
      clientedoc: new FormControl(null),
      clientenumerodoc: new FormControl(null),
      clientedireccion: new FormControl(null),
      // numerodoc: new FormControl({ value: null, disabled: true }),
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
      ventadet: new FormArray([]),
      ventapago: new FormArray([]),
      tiponc: new FormControl(null),
      documentonc: new FormControl(null),
      serienc: new FormControl(null),
      numeronc: new FormControl(null),

      descuentoporcentaje: new FormControl(null, [Validators.min(0)]),
      descuentoglobal: new FormControl(null),
      descuentoitem: new FormControl(null),
      descuentototal: new FormControl(null),
      cargo: new FormControl(null, [Validators.min(0)])
    });
  }

  calcularTotales(): void {
    console.log('calcularTotales()');
    let exonerada = 0;
    let inafecta = 0;
    let gratuita = 0;
    let gravada = 0;
    let valorimpuesto = 0;
    let total = 0;
    let descuentoItem = 0;
    let descuentoTotal = 0;
    let descuentoGlobal = 0;
    const cargos = this.ventaForm.get('cargo').value;
    const descuentoporcentaje = this.ventaForm.get('descuentoporcentaje').value;

    if (VALORUNIT_VENTA) {
      // Basado en el "valorunit" unit y "valorventa"
    } else {
      // Basado en el "preciounit" y "total"
      this.ventadet.value.forEach(element => {

        if (element.total) {
          console.log('element', element);

          descuentoItem += element.descuento;

          if (element.idimpuesto === 1) { // Gravado - Operación Onerosa 
            total += element.total;
          }

          if ([2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15].indexOf(element.idimpuesto) !== -1) { // Gratuita
            gratuita += element.total;
          }

          if (element.idimpuesto === 8) { // Exonerado - Operación Onerosa 
            exonerada += element.total;
          }

          if (element.idimpuesto === 9) { // Inafecto - Operación Onerosa
            inafecta += element.total;
          }

          if (element.idimpuesto === 16) { // Exportación
            // NO SE LA LOGICA DE EXPORTACION
          }

        }
      });

      descuentoTotal = descuentoItem;

      if (descuentoporcentaje > 0) {
        descuentoGlobal = (total * (descuentoporcentaje / 100)) - descuentoItem;
        exonerada -= (exonerada * (descuentoporcentaje / 100));
        inafecta -= (inafecta * (descuentoporcentaje / 100));
        total -= (total * (descuentoporcentaje / 100));
      }

      const valSubImpTot = this._utils.calculoLinea(1, total, 1);

      gravada = valSubImpTot.subtotal;
      valorimpuesto = valSubImpTot.montototalimpuestos;
      total = valSubImpTot.total + exonerada + inafecta + cargos;
      console.log('total', total);
    }


    this.ventaForm.get('descuentoglobal').setValue(descuentoGlobal);

    this.ventaForm.get('exonerada').setValue(exonerada);
    this.ventaForm.get('inafecta').setValue(inafecta);
    this.ventaForm.get('gratuita').setValue(gratuita);
    this.ventaForm.get('descuentoitem').setValue(descuentoItem);
    this.ventaForm.get('descuentototal').setValue(descuentoTotal);
    this.ventaForm.get('gravada').setValue(gravada);
    this.ventaForm.get('valorimpuesto').setValue(valorimpuesto);
    this.ventaForm.get('total').setValue(total);
  }

  get ventadet(): FormArray {
    return this.ventaForm.get('ventadet') as FormArray;
  }

  get ventapago(): FormArray {
    return this.ventaForm.get('ventapago') as FormArray;
  }

  autocompletadoProducto(index: number): void {
    // https://stackoverflow.com/questions/51562826/how-to-use-mat-autocomplete-angular-material-autocomplete-inside-formarray-re 
    this.filteredProductos[index] = this.ventadet.at(index).get('producto').valueChanges
      .pipe(
        startWith<string | Producto>(''),
        map(value => {
          value = value === null ? '' : value;
          return typeof value === 'string' ? value : value.nombre;
        }),
        map(value => {
          return value ? this._filterProductos(value) : this.productos.slice();
        })
      );
  }

  private _filterProductos(value: string): Producto[] {
    const filterValue = value.toLowerCase();
    return this.productos.filter(state => state.nombre.toLowerCase().indexOf(filterValue) === 0);
  }

  autocompletadoProductoSelected(option: any, index: number): void {

    let existe = 0;
    this.ventadet.value.forEach(item => {
      if (item.producto && item.producto.idproducto === option.idproducto) {
        console.log('item', item);
        existe += 1;
      }
    });

    if (existe > 1) {
      this.ventadet.at(index).get('producto').setValue('');
      this.snackBar.open(`${option.nombre} ya esta añadido.`, 'Cerrar', { duration: 4000, panelClass: ['error-dialog'] });
    } else {
      const cantidad = 1;
      const valSubImpTot = this._utils.calculoLinea(option.idimpuesto, parseFloat(option.precio), cantidad);

      this.ventadet.at(index).get('idimpuesto').setValue(option.idimpuesto, { emitEvent: false });
      this.ventadet.at(index).get('cantidad').setValue(cantidad, { emitEvent: false });
      this.ventadet.at(index).get('valorunit').setValue(valSubImpTot.valorunit, { emitEvent: false });
      this.ventadet.at(index).get('valorventa').setValue(valSubImpTot.subtotal, { emitEvent: false });
      this.ventadet.at(index).get('montototalimpuestos').setValue(valSubImpTot.montototalimpuestos, { emitEvent: false });
      this.ventadet.at(index).get('preciounit').setValue(parseFloat(option.precio), { emitEvent: false });
      this.ventadet.at(index).get('total').setValue(valSubImpTot.total, { emitEvent: false });
      this.enabledItem(index);
      this.calcularTotales();
    }
  }

  private enabledItem(index: number): void {
    this.ventadet.at(index).get('cantidad').setValidators([Validators.required, Validators.min(1)]);
    this.ventadet.at(index).get('cantidad').enable({ emitEvent: false });
    this.ventadet.at(index).get('cantidad').updateValueAndValidity({ emitEvent: false });

    this.ventadet.at(index).get('preciounit').setValidators([Validators.required]);
    this.ventadet.at(index).get('preciounit').enable({ emitEvent: false });
    this.ventadet.at(index).get('preciounit').updateValueAndValidity({ emitEvent: false });

    this.ventadet.at(index).get('descuento').enable({ emitEvent: false });
    this.ventadet.at(index).get('descuento').updateValueAndValidity({ emitEvent: false });

    this.ventadet.at(index).get('total').setValidators([Validators.required]);
    this.ventadet.at(index).get('total').enable({ emitEvent: false });
    this.ventadet.at(index).get('total').updateValueAndValidity({ emitEvent: false });
  }

  autocompletadoClienteSelected(option: any): void {
    console.log('autocompletadoClienteSelected()');
  }

  addItem(item?: any): void | boolean {
    let existe = false;
    this.ventadet.value.forEach(element => {
      if (item && element.producto && element.producto.idproducto === item.producto.idproducto) {
        existe = true;
      }
    });

    if (existe) {
      this.snackBar.open(`${item.producto.nombre} ya esta añadido.`, 'Cerrar', { duration: 4000, panelClass: ['error-dialog'] });
      return false;
    }

    let index = -1;
    for (let i = 0; i < this.ventadet.value.length; i++) {
      if (typeof this.ventadet.value[i].producto === 'string') {
        index = i;
        break;
      }
    }

    if (index !== -1 && typeof item !== 'undefined') {
      console.log('addItem() [update]');
      this.ventadet.at(index).get('producto').setValue(item ? item.producto : ''); // Actualiza el listado del autocompletable
      this.ventadet.at(index).get('descripcion').setValue(item ? item.descripcion : '', { emitEvent: false });
      this.ventadet.at(index).get('cantidad').setValue(item ? item.cantidad : '', { emitEvent: false });
      this.ventadet.at(index).get('valorunit').setValue(item ? item.valorunit : '', { emitEvent: false });
      this.ventadet.at(index).get('descuento').setValue(item ? item.descuento : '', { emitEvent: false });
      this.ventadet.at(index).get('valorventa').setValue(item ? item.valorventa : '', { emitEvent: false });
      this.ventadet.at(index).get('idimpuesto').setValue(item ? item.idimpuesto : 1, { emitEvent: false });
      this.ventadet.at(index).get('montototalimpuestos').setValue(item ? item.montototalimpuestos : '', { emitEvent: false });
      this.ventadet.at(index).get('preciounit').setValue(item ? item.preciounit : '', { emitEvent: false });
      this.ventadet.at(index).get('total').setValue(item ? item.total : '', { emitEvent: false });

      this.enabledItem(index);
      this.calcularTotales();

      if (item) {
        this.snackBar.open(`${item.producto.nombre} añadido.`, 'Cerrar', { duration: 4000 });
      }
    } else {
      console.log('addItem() [new]', item); // No funciona
      const disabled = item ? false : true;
      const phone = new FormGroup({
        producto: new FormControl(item ? item.producto : null),
        descripcion: new FormControl(item ? item.descripcion : null),
        cantidad: new FormControl({ value: item ? item.cantidad : null, disabled: disabled }),
        valorunit: new FormControl(item ? item.valorunit : null),
        descuento: new FormControl(item ? item.descuento : null),
        valorventa: new FormControl(item ? item.valorventa : null),
        idimpuesto: new FormControl(item ? item.idimpuesto : null),
        montototalimpuestos: new FormControl(item ? item.montototalimpuestos : null),
        preciounit: new FormControl({ value: item ? item.preciounit : null, disabled: disabled }),
        total: new FormControl({ value: item ? item.total : null, disabled: disabled })
      });

      this.ventadet.push(phone);
      this.autocompletadoProducto(this.ventadet.length - 1);

      if (item) {
        this.snackBar.open(`${item.producto.nombre} añadido.`, 'Cerrar', { duration: 4000 });
      }

      // Refresca cambios para el Autocomplete 
      setTimeout(() => {
        this.ventadet.at(this.ventadet.length - 1).get('producto').updateValueAndValidity();
      }, 100);
    }
  }

  deleteItem(index: number): void {
    // Al usar "this.ventadet.removeAt" no elimina el elemento "this.filteredProductos", me hizo sufrir no considerar esto.
    // this.ventadet.at(index).get('producto').valueChanges del elemento seguía activo para "this.filteredProductos"
    console.log('Remove', index);
    this.ventadet.removeAt(index);
    this.filteredProductos.splice(index, 1);
    this.calcularTotales();
  }

  displaySearchEntidad(item?): string | null {
    return item ? item.entidad : null;
  }

  displayProductoFn(item?): string | undefined {
    return item ? item.nombre : undefined;
  }

  newEntidad(): void {

    let numerodoc: string = null;

    // if (typeof this.ventaForm.get('cliente').value === 'string' && this.ventaForm.get('cliente').value) {
    if (typeof this.ventaForm.get('cliente').value === 'string' && /^[0-9]+$/.exec(this.ventaForm.get('cliente').value.trim())) {
      numerodoc = this.ventaForm.get('cliente').value.trim();
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
          numerodoc: response.numerodoc,
          entidad: response.entidad,
          sexo: response.sexo
        };

        this.searchResult.data.push(cliente);
        this.searchResult.to += 1;
        this.searchResult.total += 1;

        this.ventaForm.get('cliente').setValue(cliente);
        this.ventaForm.get('cliente').updateValueAndValidity();
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
        console.log('response', response);
        this.productos.push({
          idproducto: response.idproducto,
          codigo: response.codigo,
          nombre: response.nombre,
          precio: response.valorventa,
          unidadmedida: response.unidadmedida,
          codigosunat: response.codigosunat,
          idimpuesto: response.idimpuesto
        });

        this.producto.updateValueAndValidity();
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
      data: {
        venta: this.ventaForm.getRawValue(),

      },
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
          if (item.iddocumentofiscal === 13 && item.serie === response.serienc) {
            itemSelected = item;
          }
        });

        // Caso sea B/F física 
        if (response.serienc.substr(0, 1) === '0') {
          this.comprobantes.forEach(item => {
            const caracter = response.documentonc === 1 ? 'F' : 'B';
            if (item.iddocumentofiscal === 13 && item.serie.substr(0, 1) === caracter) {
              itemSelected = item;
            }
          });
        }

        if (itemSelected) {
          this.ventaForm.get('comprobante').setValue(itemSelected, { emitEvent: false });
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

        console.log('response', response);
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

        console.log('response', response);
      });
  }

  modalItem(row: any, index: number): void {
    const dialogRef = this._matDialog.open(VentasItemComponent, {
      panelClass: 'ventasitem-form-dialog',
      data: {
        item: row.getRawValue(),
        productos: this.productos,
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

          console.log('response', response);

          this.enabledItem(index);
          this.calcularTotales();
        }
      });
  }

  modalMediopago(): void {

    // (ngSubmit)="modalMediopago()" OCASIONA QUE EL RESETFORM NO VUELVA AL ESTADO ORIGINAL
    // this.resetForm();
    // return ; 
    if (!this.ventaForm.get('idcliente').value) {
      this.snackBar.open('Ingrese cliente', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

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


  selected(option: any): void {
    const valSubImpTot = this._utils.calculoLinea(option.idimpuesto, parseFloat(option.precio), 1);

    const item = {
      producto: {
        idproducto: option.idproducto,
        codigo: option.codigo,
        nombre: option.nombre,
        precio: option.precio,
        unidadmedida: option.unidadmedida,
        codigosunat: option.codigosunat,
        idimpuesto: option.idimpuesto
      },
      descripcion: null,
      idimpuesto: option.idimpuesto,
      cantidad: 1,
      valorunit: valSubImpTot.valorunit,
      descuento: null,
      valorventa: valSubImpTot.valorventa,
      montototalimpuestos: valSubImpTot.montototalimpuestos,
      preciounit: parseFloat(option.precio),
      total: valSubImpTot.total
    };

    this.addItem(item);
  }

  optionProductoSelected(option: any): void {
    const valSubImpTot = this._utils.calculoLinea(option.idimpuesto, parseFloat(option.precio), 1);

    const item = {
      producto: {
        idproducto: option.idproducto,
        codigo: option.codigo,
        nombre: option.nombre,
        precio: option.precio,
        unidadmedida: option.unidadmedida,
        codigosunat: option.codigosunat,
        idimpuesto: option.idimpuesto
      },
      descripcion: null,
      idimpuesto: option.idimpuesto,
      cantidad: 1,
      valorunit: valSubImpTot.valorunit,
      descuento: null,
      valorventa: valSubImpTot.subtotal,
      montototalimpuestos: valSubImpTot.montototalimpuestos,
      preciounit: parseFloat(option.precio),
      total: valSubImpTot.total
    };

    this.producto.setValue('');
    this.addItem(item);
  }

  indexEntidades(): void {
    if (this.ventaForm.controls['clientenumerodoc'].value.trim().length === 0) {
      return;
    }

    const param = {
      idempresa: this._entidadService.usuario.idempresa,
      numerodoc: this.ventaForm.controls['clientenumerodoc'].value
    };

    this.ventaForm.controls['cliente'].setValue('', { emitEvent: false });

    this._entidadService.index(param)
      .subscribe((data: any) => {

        if (data.data.length === 1) {
          this.ventaForm.controls['cliente'].setValue({
            identidad: data.data[0].identidad,
            entidad: data.data[0].entidad
          }, { emitEvent: false });

        }

        if (data.data.length === 0) {
          // swal('Upss!', `No se encontró cliente con identificación ${param.numerodoc}`, 'error');
        }

        if (data.data.length > 1) {
          // Deberia llamar a un modal para que se seleccione
          // swal('Upss!', `Se encontró mas de un cliente con identificación ${param.numerodoc}`, 'error');
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
          if (item.iddocumentofiscal === this.iddocumentofiscalDefault) {
            itemSelected = item;
          }
        });

        if (itemSelected) {
          this.ventaForm.get('comprobante').setValue(itemSelected);
        }
      });
  }

  indexProductos(): void {
    const param = {
      idempresa: this._entidadService.usuario.idempresa,
      orderName: 'nombre',
      orderSort: 'asc',
      ventaind: 2,
      // conRecurso: 'tarifas'
    };

    this._productoService.index(param)
      .subscribe((data: any) => {

        const datos: Producto[] = [];

        data.data.forEach(item => {
          datos.push({
            idproducto: item.idproducto,
            codigo: item.codigo,
            nombre: item.nombre,
            precio: item.valorventa,
            unidadmedida: item.unidadmedida,
            codigosunat: item.codigosunat,
            idimpuesto: item.idimpuesto
          });
        });

        this.productos = datos;

        this.producto.updateValueAndValidity();

        if (this.ventadet.value.length === 0) {
          this.addItem();
          this.addItem();
          this.addItem();
        }

      });
  }

  save(): void {

    let param: any = {};
    param = this.ventaForm.getRawValue();

    const ventadet = [];
    param.ventadet.forEach(item => {
      if (item.producto && item.producto.idproducto) {
        item.idproducto = item.producto.idproducto;
        item.nombre = item.producto.nombre;
        item.codigo = item.producto.codigo;
        item.unidadmedida = item.producto.unidadmedida;
        item.codigosunat = item.producto.codigosunat;
        ventadet.push(item);
      }
    });
    console.log('ventadet', ventadet);
    // return;

    param.ventadet = ventadet;
    param.fechaemision = this.pipeDate.transform(param.fechaemision, 'yyyy-MM-dd');
    param.fechavencimiento = this.pipeDate.transform(param.fechavencimiento, 'yyyy-MM-dd');
    param.detraccion = param.detraccion ? '1' : '0';
    param.selvaproducto = param.selvaproducto ? '1' : '0';
    param.selvaservicio = param.selvaservicio ? '1' : '0';

    this.snackBar.open(`Procesando venta...`);
    console.log('PARAM: ', param);

    this._ventaService.create(param).subscribe((data) => {
      this.indexDocumentoseries();
      // Mensaje
      let comprobante: string;
      switch (param.iddocumentofiscal) {
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
      this.snackBar.open(`${comprobante} ${param.serie} - ${param.numero} emitido.`, 'Cerrar');
    }, error => {
      const message = this._utils.convertError(error);
      this.submitted = false;
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
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
