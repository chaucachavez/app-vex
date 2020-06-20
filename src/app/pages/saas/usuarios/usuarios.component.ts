import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { UsuariosShowComponent } from './usuarios-show/usuarios-show.component';
import { UsuariosFormComponent } from './usuarios-form/usuarios-form.component';
import { UserService } from 'src/app/services/user.service';
import { EmpresaService } from 'src/app/services/empresa.service';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icCheck from '@iconify/icons-ic/twotone-check';
import icAccountCircle from '@iconify/icons-ic/twotone-account-circle';
import icCheckBoxOutlineBlank from '@iconify/icons-ic/twotone-check-box-outline-blank';
import { ConfirmacionComponent } from 'src/app/components/confirmacion/confirmacion.component';
import { Utils } from 'src/app/services/utils';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsuariosComponent implements OnInit {

  dialogRef: any;

  /* GRID */
  dcEntidad: string[] = ['acciones', 'email', 'name', 'celular', 'acceso', 'administrador', 'sedes'];
  dsEntidad = new MatTableDataSource();
  loadEntidad = true;
  rLengthEntidad = 0;
  pSizeEntidad = 50;
  pSizeOptEntidad: number[] = [10, 20, 50];
  @ViewChild('pagEntidad', { static: true }) pagEntidad: MatPaginator;
  @ViewChild('sortEntidad', { static: true }) sortEntidad: MatSort;
  /* GRID */

  /* BUSCARDOR PERSONA */
  cliente = new FormControl();
  isLoadingSearch = false;
  searchResult = { data: null, to: null, total: null };
  /* BUSCARDOR PERSONA */

  icSearch = icSearch;
  icAdd = icAdd;
  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;
  icCheckBoxOutlineBlank = icCheckBoxOutlineBlank;
  icCheck = icCheck;
  icAccountCircle = icAccountCircle;

  constructor(
    private _matDialog: MatDialog,
    private _userService: UserService,
    private _empresaService: EmpresaService,
    private snackBar: MatSnackBar,
    private _utils: Utils
  ) {

  }

  ngOnInit(): void {

    this.cliente.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingSearch = true),
        switchMap(data => {

          if (data === '') {
            this.index(true);
          }

          if (data && typeof data === 'string') {
            const param = {
              page: 1,
              pageSize: 10,
              orderName: 'name',
              orderSort: 'asc'
            };

            param['likeNombre'] = data;

            return this._empresaService.usuarios(param)
              .pipe(
                finalize(() => this.isLoadingSearch = false),
              );
          } else {
            this.isLoadingSearch = false;
            return [];
          }
        })
      )
      .subscribe((data: any) => {
        this.searchResult = data;
      });

    this.sortEntidad.sortChange.subscribe(() => {
      this.pagEntidad.pageIndex = 0;
      this.index();
    });

    this.pagEntidad.page.subscribe(() => {
      this.index();
    });

    this.index();
  }

  index(filterSearch?: boolean): void {

    if (filterSearch) {
      this.pagEntidad.pageIndex = 0;
    }

    const param = {
      page: this.pagEntidad.pageSize ? (this.pagEntidad.pageIndex + 1) : 1,
      pageSize: this.pagEntidad.pageSize ? this.pagEntidad.pageSize : this.pSizeEntidad,
      orderName: this.sortEntidad.active ? this.sortEntidad.active : 'name',
      orderSort: this.sortEntidad.direction ? this.sortEntidad.direction : 'asc',
      conRecurso: 'empresa,sedes'
    };

    if (this.cliente.value) {
      param['id'] = this.cliente.value.id;
    }

    this.loadEntidad = true;
    this._empresaService.usuarios(param)
      .subscribe((data: any) => {
        this.dsEntidad.data = data.data;
        this.loadEntidad = false;
        this.rLengthEntidad = data.total;
      }, error => {
        // swal('Upss!', error.error.error, 'error');
      });
  }

  // Mantenimiento personal
  newEntidad(): void {
    this.dialogRef = this._matDialog.open(UsuariosFormComponent, {
      panelClass: 'usuarios-form-dialog',
      data: {
        action: 'new',
        dialogTitle: 'Nuevo usuario',
      },
      autoFocus: false
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        this.index();
      });
  }

  editEntidad(item: any): void {
    this.dialogRef = this._matDialog.open(UsuariosFormComponent, {
      panelClass: 'usuarios-form-dialog',
      data: {
        action: 'edit',
        dialogTitle: 'Editar usuario',
        id: item.id
      },
      autoFocus: false
    });

    this.dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }
        this.index();
      });
  }

  deleteEntidad(item: any): void {

    const dialogRef = this._matDialog.open(ConfirmacionComponent, {
      panelClass: 'confirmacion-dialog',
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = `¿Estas seguro de eliminar "${item.name}"?`;

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Procesando...`, 'Cerrar');
          this._userService.delete(item.id).subscribe((data) => {
            this.snackBar.open(`"${data.name}" eliminado.`, 'Cerrar');
            this.index();
          },
            error => {
              const message = this._utils.convertError(error);
              this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
            });
        }
      });
  }

  showEntidad(item: any): void {
    this.dialogRef = this._matDialog.open(UsuariosShowComponent, {
      panelClass: 'usuarios-show-dialog',
      data: {
        id: item.id
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (response === 'edit') {
          this.editEntidad(item);
        }

        if (response === 'delete') {
          this.deleteEntidad(item);
        }

        if (response === 'refresh') {
          this.index(true);
        }
      });
  }

  displaySearchEntidad(user?): string | null {
    const valor = user ? user.name : null;
    return valor;
  }
}
