import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EntidadService } from '../../../../app/services/entidad.service';
import { Utils } from '../../../../app/services/utils';
import icClose from '@iconify/icons-ic/twotone-close';
import icSearch from '@iconify/icons-ic/twotone-search';
import { EmpresaService } from 'src/app/services/empresa.service';
import { DataInicial } from 'src/app/services/datainicial';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'vex-contacto-form',
  templateUrl: './contacto-form.component.html',
  styleUrls: ['./contacto-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContactoFormComponent implements OnInit {

  @ViewChild('numerodoc', { static: false }) numerodocElement: ElementRef;

  // Formulario
  entidadForm: FormGroup;
  dialogTitle: string;
  searching: boolean;
  submitted: boolean;
  loading: boolean;
  action: string;
  tipo: string;

  // Data inicial y listados
  documentos: any[] = this._datainicial.documentos;

  // Iconos
  icClose = icClose;
  icSearch = icSearch;

  // Tabs
  activeTabIndex = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<ContactoFormComponent>,
    private snackBar: MatSnackBar,
    private _entidadService: EntidadService,
    private _empresaService: EmpresaService,
    private _utils: Utils,
    private _datainicial: DataInicial
  ) {
    this.action = _data.action;
    this.tipo = _data.tipo;
    this.dialogTitle = _data.dialogTitle;

    if (this.action === 'edit') {
      this.show();
    } else {
      this.loading = false;
    }
  }

  ngOnInit(): void {
    this.entidadForm = this.createForm();
    if (this.action === 'new') {
      setTimeout(() => {
        this.numerodocElement.nativeElement.focus();
      }, 100);
    }

    switch (this.tipo) {
      case 'afiliado':
        this.entidadForm.addControl('afiliado', new FormControl('1'));
        break;
      case 'cliente':
        this.entidadForm.addControl('cliente', new FormControl('1'));
        break;
      case 'personal':
        this.entidadForm.addControl('personal', new FormControl('1'));
        break;
      case 'proveedor':
        this.entidadForm.addControl('proveedor', new FormControl('1'));
        break;
    }
  }

  public handleTabChange(e: MatTabChangeEvent) {
    this.activeTabIndex = e.index;
  }

  show(): void {
    this.loading = true;
    this._entidadService.show(this._data.identidad)
      .subscribe((data: any) => {
        this.loading = false;
        this.inicializarEntidad(data.data);
      });
  }

  inicializarEntidad(data): void {

    const entidad = {
      identidad: data.identidad,
      iddocumento: data.iddocumento,
      numerodoc: data.numerodoc,
      apellidopat: data.apellidopat,
      apellidomat: data.apellidomat,
      nombre: data.nombre,
      entidad: data.entidad,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion
    };

    switch (this.tipo) {
      case 'afiliado':
        entidad['afiliado'] = '1';
        break;
      case 'cliente':
        entidad['cliente'] = '1';
        break;
      case 'personal':
        entidad['personal'] = '1';
        break;
      case 'proveedor':
        entidad['proveedor'] = '1';
        break;
    }

    this.entidadForm.setValue(entidad);
  }

  createForm(): FormGroup {

    const patternEmail = '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$';

    let iddocumento: any = null;
    if (this.tipo === 'afiliado') {
      iddocumento = {
        value: 2,
        disabled: true
      };
    }

    return new FormGroup({
      identidad: new FormControl(''),
      iddocumento: new FormControl(iddocumento, [Validators.required]),
      numerodoc: new FormControl(this._data.numerodoc, [Validators.required]),
      apellidopat: new FormControl(''),
      apellidomat: new FormControl(''),
      nombre: new FormControl(''),
      entidad: new FormControl(''),
      direccion: new FormControl(''),
      telefono: new FormControl(''),
      email: new FormControl('', Validators.pattern(patternEmail))
    });
  }

  selectedDocumento(value: any): void {
    console.log('Selected', value);
    switch (value) {
      case 1:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        this.entidadForm.get('numerodoc').setValue('');
        this.entidadForm.get('entidad').setValue('');
        setTimeout(() => {
          this.numerodocElement.nativeElement.focus();
        }, 50);
        break;
      case 2:
        this.entidadForm.get('numerodoc').setValue('');
        this.entidadForm.get('apellidopat').setValue('');
        this.entidadForm.get('nombre').setValue('');
        this.entidadForm.get('entidad').setValue('');
        setTimeout(() => {
          this.numerodocElement.nativeElement.focus();
        }, 50);
        break;

      default:
        break;
    }
  }

  consultar(numerodoc: string): void {

    console.log('buscar en Sunat', numerodoc);

    // const numerodoc = this.entidadForm.get('numerodoc').value;
    if (!numerodoc) {
      this.numerodocElement.nativeElement.focus();
      console.log('NULO');
      return;
    }

    if ([8, 11].indexOf(numerodoc.length) === -1 || (['10', '20'].indexOf(numerodoc.substring(0, 2)) === -1 && numerodoc.length === 11)) {
      console.log('INVALIDO');
      return;
    }

    const param = {
      numero: numerodoc
    };

    this.searching = true;
    this._empresaService.consultaDniRuc(param)
      .subscribe((data: any) => {
        this.searching = false;
        if (numerodoc.toString().length === 8) {
          const apellidoMaterno = (data.apellidoMaterno ? (' ' + data.apellidoMaterno) : '');
          const entidad = data.apellidoPaterno + apellidoMaterno + ', ' + data.nombres;

          this.entidadForm.get('iddocumento').setValue(1);
          this.entidadForm.get('numerodoc').setValue(data.dni);
          this.entidadForm.get('apellidopat').setValue(data.apellidoPaterno + ' ' + data.apellidoMaterno);
          this.entidadForm.get('nombre').setValue(data.nombres);
          this.entidadForm.get('entidad').setValue(entidad);
        }

        if (numerodoc.toString().length === 11) {
          this.entidadForm.get('iddocumento').setValue(2);
          this.entidadForm.get('entidad').setValue(data.razonSocial);
          this.entidadForm.get('direccion').setValue(data.direccion);
        }
      }, error => {
        const message = this._utils.convertError(error);
        this.searching = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });

        // Borrar datos
        const valueDefault = {
          identidad: null,
          iddocumento: null,
          numerodoc,
          apellidopat: null,
          apellidomat: null,
          nombre: null,
          entidad: null,
          direccion: null,
          telefono: null,
          email: null
        };

        switch (this.tipo) {
          case 'afiliado':
            valueDefault['afiliado'] = '1';
            break;
          case 'cliente':
            valueDefault['cliente'] = '1';
            break;
          case 'personal':
            valueDefault['personal'] = '1';
            break;
          case 'proveedor':
            valueDefault['proveedor'] = '1';
            break;
        }

        this.entidadForm.reset(valueDefault, { emitEvent: false });
      });

  }

  save(): void {
    let param;
    param = this.entidadForm.getRawValue();

    if (param.iddocumento && [1, 3, 4].indexOf(param.iddocumento) !== -1) {
      param.entidad = param.apellidopat + (param.apellidomat ? (' ' + param.apellidomat) : '') + ', ' + param.nombre;
    }

    this.submitted = true;

    if (this.action === 'new') {

      this._entidadService.create(param).subscribe((data) => {
        this.submitted = false;
        this.snackBar.open(`Cliente registrado.`, 'Cerrar');
        this.matDialogRef.close(data.data);
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }

    if (this.action === 'edit') {
      this._entidadService.update(param.identidad, param).subscribe((data) => {
        this.snackBar.open(`Cliente actualizado.`, 'Cerrar');
        this.matDialogRef.close(data.data);
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }
  }

}
