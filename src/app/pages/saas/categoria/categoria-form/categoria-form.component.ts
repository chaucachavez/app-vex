import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Utils } from 'src/app/services/utils';
import icClose from '@iconify/icons-ic/twotone-close';
import icAdd from '@iconify/icons-ic/twotone-add';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icCallMade from '@iconify/icons-ic/twotone-call-made';
import { CategoriaService } from 'src/app/services/categoria.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-categoria-form',
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoriaFormComponent implements OnInit {

  @ViewChild('codigo', { static: false }) codigoElement: ElementRef;

  action: string;
  categoriaForm: FormGroup;
  dialogTitle: string;

  submitted = false;
  loading = false;

  icClose = icClose;
  icAdd = icAdd;
  icDelete = icDelete;
  icCallMade = icCallMade;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<CategoriaFormComponent>,
    private snackBar: MatSnackBar,
    private _categoriaService: CategoriaService,
    private _utils: Utils
  ) {
    this.action = _data.action;
    this.dialogTitle = _data.dialogTitle;

    if (this.action === 'edit') {
      this.show();
    }
  }

  ngOnInit(): void {
    this.categoriaForm = this.createForm();

    if (this.action === 'new') {
      setTimeout(() => {
        this.codigoElement.nativeElement.focus();
      }, 0);
    }

  }

  show(): void {
    this.loading = true;

    this._categoriaService.show(this._data.idcategoria)
      .subscribe((data: any) => {
        this.loading = false;
        this.inicializarCategoria(data.data);
      });
  }

  inicializarCategoria(data): void {

    const categoria = {
      idcategoria: data.idcategoria,
      codigo: data.codigo,
      nombre: data.nombre
    };

    this.categoriaForm.setValue(categoria);
  }

  createForm(): FormGroup {
    return new FormGroup({
      idcategoria: new FormControl(''),
      codigo: new FormControl('', [Validators.required]),
      nombre: new FormControl('', [Validators.required])
    });
  }

  save(): void | boolean {
    let param;
    param = this.categoriaForm.getRawValue();

    if (this.action === 'new') {
      this.submitted = true;
      this._categoriaService.create(param).subscribe((data) => {
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
      this._categoriaService.update(param.idcategoria, param).subscribe((data) => {
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
