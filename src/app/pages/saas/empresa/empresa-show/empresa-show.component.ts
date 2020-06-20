import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icCheck from '@iconify/icons-ic/twotone-check';
import { EmpresaService } from 'src/app/services/empresa.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-empresa-show',
  templateUrl: './empresa-show.component.html',
  styleUrls: ['./empresa-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmpresaShowComponent implements OnInit {

  loading: boolean;
  empresa: any;
  dialogRef: any;
  dialogTitle: string;

  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<EmpresaShowComponent>,
    private _empresaService: EmpresaService
  ) {
    this.dialogTitle = data.dialogTitle;
    this.show();
  }

  ngOnInit(): void {
  }

  show(): void {
    this.loading = true;
    this._empresaService.show(this.data.idempresa)
      .subscribe((data: any) => {
        this.empresa = data.data;
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
  }

}
