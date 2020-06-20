import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { SedeShowComponent } from './sede-show/sede-show.component';
import { SedeFormComponent } from './sede-form/sede-form.component';
import { Utils } from 'src/app/services/utils';
import { EntidadService } from 'src/app/services/entidad.service';
import { SedeService } from 'src/app/services/sede.service';

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
  selector: 'vex-sede',
  templateUrl: './sede.component.html',
  styleUrls: ['./sede.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SedeComponent implements OnInit {

  dialogRef: any;

  /* GRID */
  // dcSede: string[] = ['acciones', 'nombre', 'direccion', 'comprobantes', 'pdffactura', 'pdfboleta'];
  dcSede: string[] = ['acciones', 'nombre', 'direccion', 'comprobantes', 'pdffactura', 'pdfboleta'];
  dsSede = new MatTableDataSource();
  loadSede = true;
  rLengthSede = 0;
  pSizeSede = 50;
  pSizeOptSede: number[] = [10, 20, 50];
  @ViewChild('pagSede', { static: true }) pagSede: MatPaginator;
  @ViewChild('sortSede', { static: true }) sortSede: MatSort;
  /* GRID */

  /* BUSCARDOR SEDE */
  sede = new FormControl();
  isLoadingSearch = false;
  searchResult = {data: null, to: null, total: null};
  /* BUSCARDOR SEDE */

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
    private _entidadService: EntidadService,
    private _sedeService: SedeService,
    private _utils: Utils,
    private snackBar: MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this.sede.valueChanges
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

            return this._sedeService.index(param)
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

    this.sortSede.sortChange.subscribe(() => {
      this.pagSede.pageIndex = 0;
      this.index();
    });

    this.pagSede.page.subscribe(() => {
      this.index();
    });

    this.index();

  }

  index(filterSearch?: boolean): void {
    if (filterSearch) {
      this.pagSede.pageIndex = 0;
    }

    const param = {
      page: this.pagSede.pageSize ? (this.pagSede.pageIndex + 1) : 1,
      pageSize: this.pagSede.pageSize ? this.pagSede.pageSize : this.pSizeSede,
      orderName: this.sortSede.active ? this.sortSede.active : 'nombre',
      orderSort: this.sortSede.direction ? this.sortSede.direction : 'asc',
      conRecurso: 'comprobantes.documentofiscal'
    };

    if (this.sede.value) {
      param['idsede'] = this.sede.value.idsede;
    }

    if (this.nombre) {
      param['likeNombre'] = this.nombre;
    }


    this.loadSede = true;
    this._sedeService.index(param)
      .subscribe((data: any) => {
        this.dsSede.data = data.data;
        this.loadSede = false;
        this.rLengthSede = data.total;
      }, error => {
        // swal('Upss!', error.error.error, 'error');
      });
  }

  // Mantenimiento personal
  newSede(): void {
    this.dialogRef = this._matDialog.open(SedeFormComponent, {
      panelClass: 'sede-form-dialog',
      data: {
        action: 'new',
        dialogTitle: 'Nuevo local'
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

  editSede(id): void {
    this.dialogRef = this._matDialog.open(SedeFormComponent, {
      panelClass: 'sede-form-dialog',
      data: {
        action: 'edit',
        dialogTitle: 'Editar local',
        idsede: id
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

  deleteSede(item: any): void {

    const dialogRef = this._matDialog.open(ConfirmacionComponent, {
      panelClass: 'confirmacion-dialog',
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = `¿Estas seguro de eliminar "${item.nombre}"?`;

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Procesando...`, 'Cerrar');
          this._sedeService.delete(item.idsede).subscribe((data) => {
            this.snackBar.open(`"${data.data.nombre}" eliminado.`, 'Cerrar');
            this.index();
          },
            error => {
              const message = this._utils.convertError(error);
              this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
            });
        }
      });
  }

  showSede(item: any): void {

    this.dialogRef = this._matDialog.open(SedeShowComponent, {
      panelClass: 'sede-show-dialog',
      data: {
        dialogTitle: 'Local',
        idsede: item.idsede
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (response === 'edit') {
          this.editSede(item.idsede);
        }

        if (response === 'delete') {
          this.deleteSede(item);
        }

        if (response === 'refresh') {
          this.index(true);
        }
      });
  }

  displaySearchSede(item?): string | null {
    const valor = item ? item.nombre : null;
    return valor;
  }

}
