import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { EmpresaShowComponent } from './empresa-show/empresa-show.component';
import { EmpresaFormComponent } from './empresa-form/empresa-form.component';
import { Utils } from 'src/app/services/utils';
import { EmpresaService } from 'src/app/services/empresa.service';

import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icCheck from '@iconify/icons-ic/twotone-check';
import icCheckBoxOutlineBlank from '@iconify/icons-ic/twotone-check-box-outline-blank';
import { ConfirmacionComponent } from 'src/app/components/confirmacion/confirmacion.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmpresaComponent implements OnInit {

  dialogRef: any;

  /* GRID */
  dcEmpresa: string[] = ['acciones', 'idempresa', 'codigo', 'nombre', 'usuarios'];
  dsEmpresa = new MatTableDataSource();
  loadEmpresa = true;
  rLengthEmpresa = 0;
  pSizeEmpresa = 50;
  pSizeOptEmpresa: number[] = [10, 20, 50];
  @ViewChild('pagEmpresa', { static: true }) pagEmpresa: MatPaginator;
  @ViewChild('sortEmpresa', { static: true }) sortEmpresa: MatSort;
  /* GRID */

  /* BUSCARDOR */
  empresa = new FormControl();
  isLoadingSearch = false;
  searchResult = { data: null, to: null, total: null };
  /* BUSCARDOR */

  /* FILTROS */
  nombre = '';
  destacado = '';
  /* FILTROS */

  icSearch = icSearch;
  icAdd = icAdd;
  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;
  icVisibility = icVisibility;
  icCheckBoxOutlineBlank = icCheckBoxOutlineBlank;
  icCheck = icCheck;

  constructor(
    private _matDialog: MatDialog,
    private _empresaService: EmpresaService,
    private _utils: Utils,
    private snackBar: MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this.empresa.valueChanges
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
              orderName: 'nombre',
              orderSort: 'asc'
            };

            param['likeNombre'] = data;

            return this._empresaService.index(param)
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

    this.sortEmpresa.sortChange.subscribe(() => {
      this.pagEmpresa.pageIndex = 0;
      this.index();
    });

    this.pagEmpresa.page.subscribe(() => {
      this.index();
    });

    this.index();

  }

  index(filterSearch?: boolean): void {
    if (filterSearch) {
      this.pagEmpresa.pageIndex = 0;
    }

    const param = {
      page: this.pagEmpresa.pageSize ? (this.pagEmpresa.pageIndex + 1) : 1,
      pageSize: this.pagEmpresa.pageSize ? this.pagEmpresa.pageSize : this.pSizeEmpresa,
      orderName: this.sortEmpresa.active ? this.sortEmpresa.active : 'nombre',
      orderSort: this.sortEmpresa.direction ? this.sortEmpresa.direction : 'asc',
      conRecurso: 'usuarios'
    };

    if (this.empresa.value) {
      param['idempresa'] = this.empresa.value.idempresa;
    }

    if (this.nombre) {
      param['likeNombre'] = this.nombre;
    }


    this.loadEmpresa = true;
    this._empresaService.index(param)
      .subscribe((data: any) => {
        this.dsEmpresa.data = data.data;
        this.loadEmpresa = false;
        this.rLengthEmpresa = data.total;
      }, error => {
        // swal('Upss!', error.error.error, 'error');
      });
  }

  // Mantenimiento personal
  newEmpresa(): void {
    this.dialogRef = this._matDialog.open(EmpresaFormComponent, {
      panelClass: 'empresa-form-dialog',
      data: {
        action: 'new',
        dialogTitle: 'Nueva empresa'
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

  editEmpresa(id: number): void {
    console.log('id', id);
    this.dialogRef = this._matDialog.open(EmpresaFormComponent, {
      panelClass: 'empresa-form-dialog',
      data: {
        action: 'edit',
        dialogTitle: 'Editar empresa',
        idempresa: id
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

  deleteEmpresa(item: any): void {

    const dialogRef = this._matDialog.open(ConfirmacionComponent, {
      panelClass: 'confirmacion-dialog',
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = `¿Estas seguro de eliminar "${item.nombre}"?`;

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Procesando...`, 'Cerrar');
          this._empresaService.delete(item.idempresa).subscribe((data) => {
            console.log(data.data);
            // this.snackBar.open(`"${data.data.nombre}" eliminado.`, 'Cerrar');
            this.snackBar.open(`"${item.nombre}" eliminado.`, 'Cerrar');
            this.index();
          },
            error => {
              const message = this._utils.convertError(error);
              this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
            });
        }
      });
  }

  showEmpresa(item: any): void {

    this.dialogRef = this._matDialog.open(EmpresaShowComponent, {
      panelClass: 'empresa-show-dialog',
      data: {
        dialogTitle: 'Local',
        idempresa: item.idempresa
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (response === 'edit') {
          this.editEmpresa(item.idempresa);
        }

        if (response === 'delete') {
          this.deleteEmpresa(item);
        }

        if (response === 'refresh') {
          this.index(true);
        }
      });
  }

  displaySearchEmpresa(item?): string | null {
    const valor = item ? item.nombre : null;
    return valor;
  }

  cargarDataInicial(id: number): void {
    this.snackBar.open(`Procesando...`, 'Cerrar');
    this._empresaService.cargarData(id).subscribe((data) => {
      console.log(data.data);
      // this.snackBar.open(`"${data.data.nombre}" eliminado.`, 'Cerrar');
      this.snackBar.open(`Data cargada exitósamente.`, 'Cerrar');
      // this.index();
    }, error => {
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

}
