import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { EntidadService } from '../../../../app/services/entidad.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-entidad-show',
  templateUrl: './entidad-show.component.html',
  styleUrls: ['./entidad-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EntidadShowComponent implements OnInit {

  dcHistorias = ['sede_nombre', 'hc'];
  dcSedes = ['sede_nombre', 'sede_direccion'];
  dsHistorias = [];
  dsSedes = [];
  loading: boolean;
  entidad: any;
  dialogRef: any;
  dialogTitle: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<EntidadShowComponent>,
    private _entidadService: EntidadService
  ) {
    // this.dialogTitle = data.dialogTitle;
    this.show();
  }

  ngOnInit(): void {
  }

  show(): void {
    this.loading = true;
    this._entidadService.show(this.data.identidad, { conRecurso: 'perfil,documento,cargoorg,sedes,tarifas,historias.sede' })
      .subscribe((data: any) => {
        this.entidad = data.data;
        this.dsHistorias = data.data.historias.filter(item => item.hc);
        this.dsSedes = data.data.sedes;
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
