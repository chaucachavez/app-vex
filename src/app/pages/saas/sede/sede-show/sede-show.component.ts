import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { SedeService } from 'src/app/services/sede.service';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icCheck from '@iconify/icons-ic/twotone-check';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'vex-sede-show',
  templateUrl: './sede-show.component.html',
  styleUrls: ['./sede-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SedeShowComponent implements OnInit {

  loading: boolean;
  sede: any;
  dialogRef: any;
  dialogTitle: string;

  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;
  icCheck = icCheck;

  activeTabIndex = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<SedeShowComponent>,
    private _sedeService: SedeService
  ) {
    this.dialogTitle = data.dialogTitle;
    this.show();
  }

  ngOnInit(): void {
  }

  public handleTabChange(e: MatTabChangeEvent) {
    this.activeTabIndex = e.index;
  }

  show(): void {
    this.loading = true;
    this._sedeService.show(this.data.idsede, { conRecurso: 'comprobantes.documentofiscal' })
      .subscribe((data: any) => {
        this.sede = data.data;
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
  }

}
