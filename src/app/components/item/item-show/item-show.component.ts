import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { EntidadService } from '../../../../app/services/entidad.service';
import { ProductoService } from '../../../../app/services/producto.service';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icPrint from '@iconify/icons-ic/twotone-print';
import icClose from '@iconify/icons-ic/twotone-close';
import icCheck from '@iconify/icons-ic/twotone-check';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'vex-item-show',
  templateUrl: './item-show.component.html',
  styleUrls: ['./item-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ItemShowComponent implements OnInit {

  loading: boolean;
  producto: any;
  dialogRef: any;
  dialogTitle: string;

  icEdit = icEdit;
  icDelete = icDelete;
  icPrint = icPrint;
  icClose = icClose;
  icCheck = icCheck;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<ItemShowComponent>,
    private _matDialog: MatDialog,
    private _entidadService: EntidadService,
    private _productoService: ProductoService,
  ) {
    this.dialogTitle = data.dialogTitle;
    this.show();
  }

  ngOnInit(): void {
  }

  show(): void {
    this.loading = true;
    this._productoService.show(this.data.idproducto, { conRecurso: 'unidad,categoria,catalogo' })
      .subscribe((data: any) => {
        this.producto = data.data;
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
  }

}
