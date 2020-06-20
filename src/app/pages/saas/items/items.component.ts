import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import { ItemsCargaComponent } from './items-carga/items-carga.component';

import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icCloudUpload from '@iconify/icons-ic/twotone-cloud-upload';
import icCloudDownload from '@iconify/icons-ic/twotone-cloud-download';
import icSwapHoriz from '@iconify/icons-ic/twotone-swap-horiz';
import icCheck from '@iconify/icons-ic/twotone-check';
import icLocalOffer from '@iconify/icons-ic/twotone-local-offer';

import { EntidadService } from 'src/app/services/entidad.service';
import { ProductoService } from 'src/app/services/producto.service';
import { Utils } from 'src/app/services/utils';
import { ItemFormComponent } from 'src/app/components/item/item-form/item-form.component';
import { ItemShowComponent } from 'src/app/components/item/item-show/item-show.component';
import { ConfirmacionComponent } from 'src/app/components/confirmacion/confirmacion.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ItemsComponent implements OnInit {

  /* BUSCARDOR PRODUCTO */
  producto = new FormControl();
  isLoadingSearch = false;
  searchResult = {data: null, to: null, total: null};
  /* BUSCARDOR PRODUCTO */

  /* FILTROS */
  nombre = '';
  filter1 = new FormControl();
  filter2 = new FormControl();
  filter3 = new FormControl();
  filter4 = new FormControl();
  /* FILTROS */

  icSearch = icSearch;
  icAdd = icAdd;
  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;
  icVisibility = icVisibility;
  icMoreVert = icMoreVert;
  icCloudUpload = icCloudUpload;
  icCloudDownload = icCloudDownload;
  icSwapHoriz = icSwapHoriz;
  icCheck = icCheck;
  icLocalOffer = icLocalOffer;

  /* GRID */
  dcProducto: string[] = ['acciones', 'codigo', 'nombre', 'unidadmedida', 'moneda', 'valorventa', 'idimpuesto',
    'stock', 'categoria'];
  dsProducto = new MatTableDataSource();
  loadProducto = true;
  rLengthProducto = 0;
  pSizeProducto = 50;
  pSizeOptProducto: number[] = [10, 20, 50];
  @ViewChild('pagProducto', { static: true }) pagProducto: MatPaginator;
  @ViewChild('sortProducto', { static: true }) sortProducto: MatSort;
  /* GRID */

  constructor(
    private _matDialog: MatDialog,
    private _entidadService: EntidadService,
    private _productoService: ProductoService,
    private _utils: Utils,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {

    this.producto.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingSearch = true),
        switchMap(data => {

          if (data === '') {
            this.index(true);
          }

          if (data && typeof data === 'string') {
            const param = {
              idempresa: this._entidadService.usuario.idempresa,
              page: 1,
              pageSize: 10,
              orderName: 'nombre',
              orderSort: 'asc'
            };

            param['likeNombre'] = data;

            return this._productoService.index(param)
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

    this.sortProducto.sortChange.subscribe(() => {
      this.pagProducto.pageIndex = 0;
      this.index();
    });

    this.pagProducto.page.subscribe(() => {
      this.index();
    });

    this.index();
  }

  index(filterSearch?: boolean): void {

    if (filterSearch) {
      this.pagProducto.pageIndex = 0;
    }

    const param = {
      page: this.pagProducto.pageSize ? (this.pagProducto.pageIndex + 1) : 1,
      pageSize: this.pagProducto.pageSize ? this.pagProducto.pageSize : this.pSizeProducto,
      orderName: this.sortProducto.active ? this.sortProducto.active : 'nombre',
      orderSort: this.sortProducto.direction ? this.sortProducto.direction : 'asc',
      conRecurso: 'categoria'
    };

    if (this.producto.value) {
      param['idproducto'] = this.producto.value.idproducto;
    }

    this.loadProducto = true;
    this._productoService.index(param)
      .subscribe((data: any) => {
        this.dsProducto.data = data.data;
        this.loadProducto = false;
        this.rLengthProducto = data.total;
      }, error => {
        // swal('Upss!', error.error.error, 'error');
      });
  }

  // Mantenimiento personal
  newProducto(): void {
    const dialogRef = this._matDialog.open(ItemFormComponent, {
      panelClass: 'item-form-dialog',
      data: {
        action: 'new',
        dialogTitle: 'Nuevo producto'
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        this.index();
      });
  }

  editProducto(id): void {
    const dialogRef = this._matDialog.open(ItemFormComponent, {
      panelClass: 'item-form-dialog',
      data: {
        action: 'edit',
        dialogTitle: 'Editar producto',
        idproducto: id
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }
        this.index();
      });
  }

  deleteProducto(item: any): void {

    const dialogRef = this._matDialog.open(ConfirmacionComponent, {
      panelClass: 'confirmacion-dialog',
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = `¿Estas seguro de eliminar "${item.nombre}"?`;

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Procesando...`, 'Cerrar');
          this._productoService.delete(item.idproducto).subscribe((data) => {
            this.snackBar.open(`"${data.nombre}" eliminado.`, 'Cerrar');
            this.index();
          },
            error => {
              const message = this._utils.convertError(error);
              this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
            });
        }
      });
  }

  showProducto(item: any): void {

    const dialogRef = this._matDialog.open(ItemShowComponent, {
      panelClass: 'item-show-dialog',
      data: {
        dialogTitle: 'Ítem de venta',
        idproducto: item.idproducto
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (response === 'edit') {
          this.editProducto(item.idproducto);
        }

        if (response === 'delete') {
          this.deleteProducto(item);
        }

        if (response === 'refresh') {
          this.index();
        }
      });
  }

  displaySearchProducto(item?): string | null {
    const valor = item ? item.nombre : null;
    return valor;
  }

  resetForm(): void {
    this.producto.setValue('');
    this.index();
  }

  descargaMasiva(formato): void {
    const param = {
      stockMayor: 0,
      conRecurso: 'categoria'
    };

    if (formato === 'excel') {
      this.loadProducto = true;
      this._productoService.exportExcel(param).subscribe((data) => {
        this.loadProducto = false;
        saveAs(data, 'ProductosExcel.xlsx');
      }, (error) => {
        this.loadProducto = false;
        const message = this._utils.convertError(error);
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }
  }

  modalCargamasiva(): void {
    const dialogRef = this._matDialog.open(ItemsCargaComponent, {
      panelClass: 'itemscarga-form-dialog',
      data: {
        // venta: this.ventaForm.getRawValue()
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }

        this.index();

      });
  }

}
