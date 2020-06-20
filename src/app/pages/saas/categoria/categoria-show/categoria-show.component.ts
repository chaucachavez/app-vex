import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icCheck from '@iconify/icons-ic/twotone-check';
import { CategoriaService } from 'src/app/services/categoria.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-categoria-show',
  templateUrl: './categoria-show.component.html',
  styleUrls: ['./categoria-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoriaShowComponent implements OnInit {

  loading: boolean;
  categoria: any;
  dialogRef: any;
  dialogTitle: string;

  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<CategoriaShowComponent>,
    private _categoriaService: CategoriaService
  ) {
    this.dialogTitle = data.dialogTitle;
    this.show();
  }

  ngOnInit(): void {
  }

  show(): void {
    this.loading = true;
    this._categoriaService.show(this.data.idcategoria)
      .subscribe((data: any) => {
        this.categoria = data.data;
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
  }

}
