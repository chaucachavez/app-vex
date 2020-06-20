import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Utils } from 'src/app/services/utils';
import icClose from '@iconify/icons-ic/twotone-close';
import icAdd from '@iconify/icons-ic/twotone-add';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icCallMade from '@iconify/icons-ic/twotone-call-made';
import { EmpresaService } from 'src/app/services/empresa.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-empresa-form',
  templateUrl: './empresa-form.component.html',
  styleUrls: ['./empresa-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmpresaFormComponent implements OnInit {

  @ViewChild('ruc', { static: false }) rucElement: ElementRef;

  action: string;
  empresaForm: FormGroup;
  dialogTitle: string;

  submitted = false;
  loading = false;

  icClose = icClose;
  icAdd = icAdd;
  icDelete = icDelete;
  icCallMade = icCallMade;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<EmpresaFormComponent>,
    private snackBar: MatSnackBar,
    private _empresaService: EmpresaService,
    private _utils: Utils
  ) {
    this.action = _data.action;
    this.dialogTitle = _data.dialogTitle;

    if (this.action === 'edit') {
      this.show();
    }
  }

  ngOnInit(): void {
    this.empresaForm = this.createForm();

    if (this.action === 'new') {
      setTimeout(() => {
        this.rucElement.nativeElement.focus();
      }, 0);
    }

  }

  show(): void {
    this.loading = true;

    this._empresaService.show(this._data.idempresa)
      .subscribe((data: any) => {
        this.loading = false;
        this.inicializarEmpresa(data.data);
      });
  }

  inicializarEmpresa(data): void {

    const empresa = {
      idempresa: data.idempresa,
      ruc: data.ruc,
      nombre: data.nombre
    };

    this.empresaForm.setValue(empresa);
  }

  createForm(): FormGroup {
    return new FormGroup({
      idempresa: new FormControl(''),
      ruc: new FormControl('', [Validators.required]),
      nombre: new FormControl('', [Validators.required])
    });
  }

  save(): void | boolean {
    let param;
    param = this.empresaForm.getRawValue();

    if (this.action === 'new') {
      this.submitted = true;
      this._empresaService.create(param).subscribe((data) => {
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
      this._empresaService.update(param.idempresa, param).subscribe((data) => {
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
