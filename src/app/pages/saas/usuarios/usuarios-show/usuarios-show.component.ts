import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icPerson from '@iconify/icons-ic/twotone-person';
import icEmail from '@iconify/icons-ic/twotone-email';
import icPhone from '@iconify/icons-ic/twotone-phone';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-usuarios-show',
  templateUrl: './usuarios-show.component.html',
  styleUrls: ['./usuarios-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsuariosShowComponent implements OnInit {

  dsSedes = [];
  loading: boolean;
  usuario: any;
  dialogTitle: string;

  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;
  icPerson = icPerson;
  icEmail = icEmail;
  icPhone = icPhone;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<UsuariosShowComponent>,
    private _userService: UserService
  ) {
    this.dialogTitle = data.dialogTitle;
    this.show();
  }

  ngOnInit(): void {
  }

  show(): void {
    this.loading = true;
    this._userService.show(this.data.id, { conRecurso: 'sedes' })
      .subscribe((data: any) => {
        this.usuario = data.data;
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
  }

}
