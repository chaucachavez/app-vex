import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Utils } from 'src/app/services/utils';
import { SedeService } from 'src/app/services/sede.service';
import icClose from '@iconify/icons-ic/twotone-close';
import icAdd from '@iconify/icons-ic/twotone-add';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icCallMade from '@iconify/icons-ic/twotone-call-made';
import { UbigeoService } from 'src/app/services/ubigeo.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'vex-sede-form',
  templateUrl: './sede-form.component.html',
  styleUrls: ['./sede-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SedeFormComponent implements OnInit {

  @ViewChild('nombre', { static: false }) nombreElement: ElementRef;

  action: string;
  sedeForm: FormGroup;
  dialogTitle: string;
  documentos: any[] = [
    { iddocumentofiscal: 1, nombre: 'Factura' },
    { iddocumentofiscal: 2, nombre: 'Boleta de venta' },
    { iddocumentofiscal: 13, nombre: 'Nota de crédito' },
    { iddocumentofiscal: 10, nombre: 'Nota de débito' }
  ];

  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];

  formatos: any[] = [
    { id: 'A4', nombre: 'A4' },
    { id: 'A5', nombre: 'A5 (Mitad de A4)' },
    { id: 'TICKET', nombre: 'Ticket' }
  ];
  // departamentoCtrl = new FormControl(null, [Validators.required]);
  // provinciaCtrl = new FormControl(null, [Validators.required]);
  // distritoCtrl = new FormControl(null, [Validators.required]);
  submitted = false;
  loading: boolean;

  icClose = icClose;
  icAdd = icAdd;
  icDelete = icDelete;
  icCallMade = icCallMade;

  activeTabIndex = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<SedeFormComponent>,
    private snackBar: MatSnackBar,
    private _sedeService: SedeService,
    private _ubigeoService: UbigeoService,
    private _utils: Utils
  ) {
    // Set the defaults
    this.action = _data.action;
    this.dialogTitle = _data.dialogTitle;

    if (this.action === 'edit') {
      this.show();
    } else {
      this.loading = false;
    }
  }

  ngOnInit(): void {
    this.sedeForm = this.createForm();

    if (this.action === 'new') {
      setTimeout(() => {
        this.nombreElement.nativeElement.focus();
      }, 0);
    }

    this.sedeForm.get('comercial').valueChanges.subscribe((data) => {
      if (!data) {
        this.sedeForm.get('pdffactura').setValue(null);
        this.sedeForm.get('pdfboleta').setValue(null);
      }
    });

    this.sedeForm.get('ubigeodepa').valueChanges.subscribe((data) => {
      if (data) {

        const param = {
          codigo: data
        };

        this.sedeForm.get('ubigeoprov').setValue(null);
        this.sedeForm.get('ubigeo').setValue(null);

        this._ubigeoService.provincias(param)
          .subscribe((provincias: any) => {
            this.provincias = provincias.data;
          });
      }
    });

    this.sedeForm.get('ubigeoprov').valueChanges.subscribe((data) => {
      if (data) {
        const param = {
          codigo: data
        };
        this._ubigeoService.distritos(param)
          .subscribe((distritos: any) => {
            this.distritos = distritos.data;
          });
      }
    });

    if (this.action === 'new') {
      // En createForm no es conveniente definir el valor por defecto, es conveniente el 'valueChanges' de 'ubigeodepa' por setValue()
      this.sedeForm.get('ubigeodepa').setValue('15');
      this.sedeForm.get('ubigeoprov').setValue('1501');
      this.sedeForm.get('ubigeo').setValue('150101');
    }

    this.listaDepartamentos();
  }

  public handleTabChange(e: MatTabChangeEvent) {
    this.activeTabIndex = e.index;
  }

  show(): void {
    this.loading = true;
    const param = {
      conRecurso: 'comprobantes.documentofiscal'
    };

    this._sedeService.show(this._data.idsede, param)
      .subscribe((data: any) => {
        this.loading = false;
        this.inicializarSede(data.data);
      });
  }

  inicializarSede(data): void {

    const sede = {
      idsede: data.idsede,
      nombre: data.nombre,
      abreviatura: data.abreviatura,
      comercial: data.comercial === '1' ? true : false,
      codigosunat: data.codigosunat,
      ubigeodepa: data.ubigeo.substring(0, 2),
      ubigeoprov: data.ubigeo.substring(0, 4),
      ubigeo: data.ubigeo,
      departamento: data.departamento,
      provincia: data.provincia,
      distrito: data.distrito,
      direccion: data.direccion,
      pdffactura: data.pdffactura,
      pdfboleta: data.pdfboleta,
      pdfcabecera: data.pdfcabecera,
      pdfnombre: data.pdfnombre,
      pdfcolor: data.pdfcolor,
      comprobantes: []
    };

    this.sedeForm.setValue(sede);

    data.comprobantes.forEach(row => {
      this.addItem(row);
    });
  }

  createForm(): FormGroup {
    return new FormGroup({
      idsede: new FormControl(''),
      nombre: new FormControl('', [Validators.required]),
      abreviatura: new FormControl(''),
      comercial: new FormControl(this.action === 'new' ? true : false, Validators.required),
      codigosunat: new FormControl('0000', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]),
      ubigeodepa: new FormControl('', [Validators.required]), // 15
      ubigeoprov: new FormControl('', [Validators.required]), // 1501
      ubigeo: new FormControl('', [Validators.required]), // 150101
      departamento: new FormControl(''),
      provincia: new FormControl(''),
      distrito: new FormControl(''),
      direccion: new FormControl('', [Validators.required]),
      pdffactura: new FormControl('A4'),
      pdfboleta: new FormControl('A4'),
      pdfcabecera: new FormControl(''),
      pdfnombre: new FormControl(''),
      pdfcolor: new FormControl('25,8,255'),
      comprobantes: new FormArray([])
    });
  }

  get xxx(): FormArray {
    return this.sedeForm.get('comprobantes') as FormArray;
  }

  addItem(item?): void | boolean {
    const tmp = new FormGroup({
      iddocumentofiscal: new FormControl(item ? item.iddocumentofiscal : ''),
      serie: new FormControl(item ? item.serie : '', [Validators.minLength(4), Validators.maxLength(4)]),
      numero: new FormControl(item ? item.numero : 1),
      contingencia: new FormControl(item && item.contingencia === '1' ? true : false),
    });

    this.xxx.push(tmp);
  }

  deleteItem(index: number): void {
    this.xxx.removeAt(index);
  }

  listaDepartamentos(): void {
    this._ubigeoService.departamentos()
      .subscribe((data: any) => {
        this.departamentos = data.data;
      });
  }

  save(): void | boolean {
    let param;
    param = this.sedeForm.getRawValue();
    param.comercial = param.comercial ? '1' : '0';
    param.departamento = this.departamentos.filter(departamento => departamento.id === param.ubigeo.substring(0, 2))[0]['nombre'];
    param.provincia = this.provincias.filter(provincia => provincia.id === param.ubigeo.substring(0, 4))[0]['nombre'];
    param.distrito = this.distritos.filter(distrito => distrito.id === param.ubigeo)[0]['nombre'];

    let inValidDocumento = false;
    let inValidSerie = false;
    let inValidNumero = false;
    const comprobantes = [];

    if (param.comercial === '1') {

      param.comprobantes.forEach(row => {
        const item = {
          iddocumentofiscal: row.iddocumentofiscal,
          serie: row.serie,
          numero: row.numero,
          contingencia: row.contingencia ? '1' : '0'
        };

        if (!row.iddocumentofiscal) {
          inValidDocumento = true;
        }

        if (!row.serie) {
          inValidSerie = true;
        }

        if (!row.numero) {
          inValidNumero = true;
        }

        if (row.serie && row.numero && row.iddocumentofiscal) {
          comprobantes.push(item);
        }
      });

      if (inValidDocumento) {
        this.snackBar.open('Seleccione comprobante', 'Cerrar', { panelClass: ['error-dialog'] });
        return false;
      }

      if (inValidSerie) {
        this.snackBar.open('Ingrese serie para comprobante', 'Cerrar', { panelClass: ['error-dialog'] });
        return false;
      }

      if (inValidNumero) {
        this.snackBar.open('Ingrese número para comprobante', 'Cerrar', { panelClass: ['error-dialog'] });
        return false;
      }

      if (comprobantes.length === 0) {
        this.snackBar.open('Agregue al menos un comprobante y serie', 'Cerrar', { panelClass: ['error-dialog'] });
        return false;
      }

      param.comprobantes = comprobantes;
    } else {
      if (param.hasOwnProperty('comprobantes')) {
        delete param.comprobantes;
      }
    }
    // return false;

    if (this.action === 'new') {
      this.submitted = true;
      this._sedeService.create(param).subscribe((data) => {
        this.snackBar.open(`${data.data.nombre} creado.`, 'Cerrar');
        this.matDialogRef.close(data.data);
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }

    if (this.action === 'edit') {
      this.submitted = true;
      this._sedeService.update(param.idsede, param).subscribe((data) => {
        this.snackBar.open(`${data.data.nombre} actualizado.`, 'Cerrar');
        this.matDialogRef.close(data.data);
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }
  }

}
