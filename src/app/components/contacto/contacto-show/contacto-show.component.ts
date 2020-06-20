import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { EntidadService } from '../../../../app/services/entidad.service';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete'; 
import icClose from '@iconify/icons-ic/twotone-close';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-contacto-show',
  templateUrl: './contacto-show.component.html',
  styleUrls: ['./contacto-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContactoShowComponent implements OnInit {

  loading: boolean;
  entidad: any;
  dialogRef: any;
  dialogTitle: string;

  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<ContactoShowComponent>,
    private _entidadService: EntidadService
  ) {
    this.dialogTitle = data.dialogTitle;
    this.show();
  }

  ngOnInit(): void {
  }

  show(): void {
    this.loading = true;
    this._entidadService.show(this.data.identidad, { conRecurso: 'documento' })
      .subscribe((data: any) => {
        this.entidad = data.data;
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
  }

  deleteEntidad(entidad): void {
    this._entidadService.delete(entidad.identidad).subscribe(() => {
      this.matDialogRef.close('refresh');
    }, error => {
      // swal('Upss!', error.error.error, 'error');
    });
  }
}
