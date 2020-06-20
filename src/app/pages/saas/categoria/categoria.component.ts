import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { CategoriaShowComponent } from './categoria-show/categoria-show.component';
import { CategoriaFormComponent } from './categoria-form/categoria-form.component';
import { Utils } from 'src/app/services/utils';
import { CategoriaService } from 'src/app/services/categoria.service';

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
  selector: 'vex-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CategoriaComponent implements OnInit {

  dialogRef: any;

  /* GRID */
  dcCategoria: string[] = ['acciones', 'codigo', 'nombre'];
  dsCategoria = new MatTableDataSource();
  loadCategoria = true;
  rLengthCategoria = 0;
  pSizeCategoria = 50;
  pSizeOptCategoria: number[] = [10, 20, 50];
  @ViewChild('pagCategoria', { static: true }) pagCategoria: MatPaginator;
  @ViewChild('sortCategoria', { static: true }) sortCategoria: MatSort;
  /* GRID */

  /* BUSCARDOR */
  categoria = new FormControl();
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
    private _categoriaService: CategoriaService,
    private _utils: Utils,
    private snackBar: MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this.categoria.valueChanges
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

            return this._categoriaService.index(param)
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

    this.sortCategoria.sortChange.subscribe(() => {
      this.pagCategoria.pageIndex = 0;
      this.index();
    });

    this.pagCategoria.page.subscribe(() => {
      this.index();
    });

    this.index();

  }

  index(filterSearch?: boolean): void {
    if (filterSearch) {
      this.pagCategoria.pageIndex = 0;
    }

    const param = {
      page: this.pagCategoria.pageSize ? (this.pagCategoria.pageIndex + 1) : 1,
      pageSize: this.pagCategoria.pageSize ? this.pagCategoria.pageSize : this.pSizeCategoria,
      orderName: this.sortCategoria.active ? this.sortCategoria.active : 'nombre',
      orderSort: this.sortCategoria.direction ? this.sortCategoria.direction : 'asc',
      // conRecurso: 'comprobantes.documentofiscal'
    };

    if (this.categoria.value) {
      param['idcategoria'] = this.categoria.value.idcategoria;
    }

    if (this.nombre) {
      param['likeNombre'] = this.nombre;
    }


    this.loadCategoria = true;
    this._categoriaService.index(param)
      .subscribe((data: any) => {
        this.dsCategoria.data = data.data;
        this.loadCategoria = false;
        this.rLengthCategoria = data.total;
      }, error => {
        // swal('Upss!', error.error.error, 'error');
      });
  }

  // Mantenimiento personal
  newCategoria(): void {
    this.dialogRef = this._matDialog.open(CategoriaFormComponent, {
      panelClass: 'categoria-form-dialog',
      data: {
        action: 'new',
        dialogTitle: 'Nueva categoria'
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

  editCategoria(id: number): void {
    console.log('id', id);
    this.dialogRef = this._matDialog.open(CategoriaFormComponent, {
      panelClass: 'categoria-form-dialog',
      data: {
        action: 'edit',
        dialogTitle: 'Editar categoria',
        idcategoria: id
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

  deleteCategoria(item: any): void {

    const dialogRef = this._matDialog.open(ConfirmacionComponent, {
      panelClass: 'confirmacion-dialog',
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = `¿Estas seguro de eliminar "${item.nombre}"?`;

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Procesando...`, 'Cerrar');
          this._categoriaService.delete(item.idcategoria).subscribe((data) => {
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

  showCategoria(item: any): void {

    this.dialogRef = this._matDialog.open(CategoriaShowComponent, {
      panelClass: 'categoria-show-dialog',
      data: {
        dialogTitle: 'Local',
        idcategoria: item.idcategoria
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (response === 'edit') {
          this.editCategoria(item.idcategoria);
        }

        if (response === 'delete') {
          this.deleteCategoria(item);
        }

        if (response === 'refresh') {
          this.index(true);
        }
      });
  }

  displaySearchCategoria(item?): string | null {
    const valor = item ? item.nombre : null;
    return valor;
  }

}
