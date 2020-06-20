import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { EmpresaService } from 'src/app/services/empresa.service';
import { EntidadService } from 'src/app/services/entidad.service';
import icArrowBack from '@iconify/icons-ic/twotone-arrow-back';
import icCancel from '@iconify/icons-ic/twotone-cancel';
import { URL_SERVICIOS } from 'src/app/config/config';
import { Utils } from 'src/app/services/utils';
import { ConfigService } from 'src/@vex/services/config.service';
import { UnidadService } from 'src/app/services/unidad';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-config',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmpresaComponent implements OnInit {

  empresa: any;
  empresaForm: FormGroup;

  /* UploadImg */
  logocuadradoTemp: any;
  logopdfTemp: any;
  /* UploadImg */

  /* Chips */
  unidadCtrl = new FormControl();
  filtrarUnidades: Observable<string[]>;
  unidades: any = [];
  @ViewChild('unidadInput', { static: true }) unidadInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;
  /* Chips */

  icArrowBack = icArrowBack;
  icCancel = icCancel;
  submitted = false;


  constructor(
    private _empresaService: EmpresaService,
    private _entidadService: EntidadService,
    private _unindadService: UnidadService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private _utils: Utils,
  ) {
    this.show();
  }

  ngOnInit(): void {
    this.empresaForm = this.createForm();
    this.indexUnidades();

    this.filtrarUnidades = this.unidadCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.unidades.slice()));
  }

  createForm(): FormGroup {
    return new FormGroup({
      ruc: new FormControl('', [Validators.required]),
      razonsocial: new FormControl('', [Validators.required]),
      nombre: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefono: new FormControl(''),
      paginaweb: new FormControl(''),
      ctadetraccion: new FormControl(''),
      logopdf: new FormControl(''),
      logocuadrado: new FormControl(''),
      preciounitario: new FormControl(false),
      tipocambio: new FormControl(false),
      tipocambiovalor: new FormControl(''),
      tipocalculo: new FormControl(''),
      mediopago: new FormControl(false),
      recargoconsumo: new FormControl(false),
      recargoconsumovalor: new FormControl(''),
      productoselva: new FormControl(false),
      servicioselva: new FormControl(false),
      medidas: new FormControl([]),
    });
  }

  show(): void {
    const param = {
      conRecurso: 'medidas'
    };
    this._empresaService.cuenta(param)
      .subscribe((data: any) => {
        this.inicializarEmpresa(data.data);
      });
  }

  inicializarEmpresa(data): void {

    const empresa = {
      ruc: data.ruc,
      razonsocial: data.razonsocial,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      paginaweb: data.paginaweb,
      ctadetraccion: data.ctadetraccion,
      logopdf: data.logopdf,
      logocuadrado: data.logocuadrado,
      preciounitario: data.preciounitario === '1' ? true : false,
      tipocambio: data.tipocambio === '1' ? true : false,
      tipocambiovalor: data.tipocambiovalor,
      tipocalculo: data.tipocalculo,
      mediopago: data.mediopago === '1' ? true : false,
      recargoconsumo: data.recargoconsumo === '1' ? true : false,
      recargoconsumovalor: data.recargoconsumovalor,
      productoselva: data.productoselva === '1' ? true : false,
      servicioselva: data.servicioselva === '1' ? true : false,
      medidas: data.medidas
    };

    this.empresaForm.setValue(empresa);
  }

  seleccionImage(archivo: File, tipo: string): void | boolean {
    if (!archivo) {
      return;
    }

    if (archivo.type.indexOf('image') === -1) {
      this.snackBar.open('El archivo seleccionado no es una imagen', 'Cerrar', { panelClass: ['error-dialog'] });
      return false;
    }

    const imagenSubir: File = archivo;

    const reader = new FileReader();
    reader.readAsDataURL(archivo);

    if (tipo === 'logopdf') {
      reader.onloadend = () => this.logopdfTemp = reader.result;
    }

    if (tipo === 'logocuadrado') {
      reader.onloadend = () => this.logocuadradoTemp = reader.result;
    }

    this._empresaService.updateImg(imagenSubir, { key: 'tipo', value: tipo })
      .then(data => {

        if (tipo === 'logocuadrado') {
          this.configService.updateConfig({
            sidenav: {
              imageUrl: URL_SERVICIOS + '/empresa/' + data.data.idempresa + '/img/' + data.data.logocuadrado
            }
          });

          this.empresaForm.get('logocuadrado').setValue(data.data.logocuadrado);
        }

        this.snackBar.open(`Se actualizó imagen`, 'Cerrar');
      })
      .catch(data => {
      });
  }

  indexUnidades(): void {
    const param = {
      orderName: 'nombre',
      orderSort: 'asc',
    };

    this._unindadService.index(param)
      .subscribe((data: any) => {
        this.unidades = data.data;
        setTimeout(() => {
          this.unidadCtrl.updateValueAndValidity();
        }, 100);
      });
  }

  save(): void {
    let param;
    param = this.empresaForm.getRawValue();

    param.preciounitario = param.preciounitario ? '1' : '0';
    param.tipocambio = param.tipocambio ? '1' : '0';
    param.mediopago = param.mediopago ? '1' : '0';
    param.recargoconsumo = param.recargoconsumo ? '1' : '0';
    param.productoselva = param.productoselva ? '1' : '0';
    param.servicioselva = param.servicioselva ? '1' : '0';

    const medidas = [];
    param.medidas.forEach(row => {
      medidas.push(row.codigo);
    });

    param.medidas = medidas;

    if (param.medidas.length === 0) {
      this.snackBar.open('Añada al menos una unidad de medida', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

    this.submitted = true;
    this._empresaService.update(this._entidadService.usuario.idempresa, param)
      .subscribe((data) => {

        this.configService.updateConfig({
          sidenav: {
            title: data.nombre,
            imageUrl: URL_SERVICIOS + '/empresa/' + data.idempresa + '/img/' + data.logocuadrado
          }
        });
        this.submitted = false;
        this.snackBar.open(`Empresa actualizada.`, 'Cerrar');
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
  }

  /* Chips */

  remove(fruit: string): void {
    console.log('fruit remove()', fruit);
    const index = this.empresaForm.get('medidas').value.indexOf(fruit);

    if (index >= 0) {
      this.empresaForm.get('medidas').value.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log('event.option.viewValue', event.option.viewValue);
    let exits = false;
    this.empresaForm.get('medidas').value.forEach(data => {
      if (data.codigo === event.option.value.codigo) {
        exits = true;
      }
    });

    if (!exits) {
      this.empresaForm.get('medidas').value.push(event.option.value);
    } else {
      this.snackBar.open(event.option.value.nombre + ' ya existe.', 'Cerrar', { panelClass: ['error-dialog'] });
    }

    this.unidadInput.nativeElement.value = '';
    this.unidadCtrl.setValue(null);
  }

  private _filter(value: any): any[] {
    if (typeof value === 'string') {
      return this.unidades.filter(fruit =>
        fruit.codigo.toLowerCase().indexOf(value.toLowerCase()) === 0 ||
        fruit.nombre.toLowerCase().indexOf(value.toLowerCase()) === 0
      );
    }
  }
  /* Chips */

}
