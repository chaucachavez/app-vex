import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { ContactoShowComponent } from 'src/app/components/contacto/contacto-show/contacto-show.component';
import { ContactoFormComponent } from 'src/app/components/contacto/contacto-form/contacto-form.component';
import { EntidadService } from 'src/app/services/entidad.service';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDomain from '@iconify/icons-ic/twotone-domain';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icAccountCircle from '@iconify/icons-ic/twotone-account-circle';
import icCloudUpload from '@iconify/icons-ic/twotone-cloud-upload';
import icCloudDownload from '@iconify/icons-ic/twotone-cloud-download';
import icSwapHoriz from '@iconify/icons-ic/twotone-swap-horiz';
import icCheck from '@iconify/icons-ic/twotone-check';
import { ConfirmacionComponent } from 'src/app/components/confirmacion/confirmacion.component';
import { Utils } from 'src/app/services/utils';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-afiliado',
  templateUrl: './afiliado.component.html',
  styleUrls: ['./afiliado.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AfiliadoComponent implements OnInit {

  // Grid afiliado
  dcEntidad: string[] = ['acciones', 'documento', 'numerodoc', 'entidad', /*'direccion',*/ 'telefono', 'email'];
  dsEntidad = new MatTableDataSource();
  loadEntidad = true;
  rLengthEntidad = 0;
  pSizeEntidad = 50;
  pSizeOptEntidad: number[] = [10, 20, 50];
  @ViewChild('pagEntidad', { static: true }) pagEntidad: MatPaginator;
  @ViewChild('sortEntidad', { static: true }) sortEntidad: MatSort;

  // Buscador cliente
  cliente = new FormControl();
  isLoadingSearch = false;
  searchResult = { data: null, to: null, total: null };

  // Iconos
  icAdd = icAdd;
  icEdit = icEdit;
  icCheck = icCheck;
  icClose = icClose;
  icSearch = icSearch;
  icDelete = icDelete;
  icDomain = icDomain;
  icMoreVert = icMoreVert;
  icSwapHoriz = icSwapHoriz;
  icVisibility = icVisibility;
  icCloudUpload = icCloudUpload;
  icAccountCircle = icAccountCircle;
  icCloudDownload = icCloudDownload;

  constructor(
    private _matDialog: MatDialog,
    private _entidadService: EntidadService,
    private _utils: Utils,
    private snackBar: MatSnackBar
  ) {

  }

  ngOnInit(): void {

    this.cliente.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingSearch = true),
        switchMap(data => {

          if (typeof data === 'string' && data === '') {
            this.index(true);
          }

          if (typeof data === 'string' && data) {
            const param = {
              idempresa: this._entidadService.usuario.idempresa,
              page: 1,
              pageSize: 10,
              orderName: 'entidad',
              orderSort: 'asc',
              afiliado: '1'
            };

            if (parseFloat(data) > 0) {
              param['likeNumerodoc'] = data;
            } else {
              param['likeEntidad'] = data;
            }

            return this._entidadService.index(param)
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
      idempresa: this._entidadService.usuario.idempresa,
      page: this.pagEntidad.pageSize ? (this.pagEntidad.pageIndex + 1) : 1,
      pageSize: this.pagEntidad.pageSize ? this.pagEntidad.pageSize : this.pSizeEntidad,
      orderName: this.sortEntidad.active ? this.sortEntidad.active : 'entidad',
      orderSort: this.sortEntidad.direction ? this.sortEntidad.direction : 'asc',
      afiliado: '1'
    };

    if (this.cliente.value && this.cliente.value.identidad) {
      param['identidad'] = this.cliente.value.identidad;
    }

    this.loadEntidad = true;
    this._entidadService.index(param)
      .subscribe((data: any) => {
        this.dsEntidad.data = data.data;
        this.loadEntidad = false;
        this.rLengthEntidad = data.total;
      }, error => {
        // swal('Upss!', error.error.error, 'error');
      });
  }

  newEntidad(): void {
    const dialogRef = this._matDialog.open(ContactoFormComponent, {
      panelClass: 'contacto-form-dialog',
      data: {
        action: 'new',
        dialogTitle: 'Nuevo afiliado',
        tipo: 'afiliado'
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

  editEntidad(id: number): void {
    const dialogRef = this._matDialog.open(ContactoFormComponent, {
      panelClass: 'contacto-form-dialog',
      data: {
        action: 'edit',
        dialogTitle: 'Editar afiliado',
        tipo: 'afiliado',
        identidad: id
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

  deleteEntidad(item: any): void {

    const dialogRef = this._matDialog.open(ConfirmacionComponent, {
      panelClass: 'confirmacion-dialog',
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = `¿Estas seguro de eliminar a ${item.entidad}?`;

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Procesando...`, 'Cerrar');
          this._entidadService.delete(item.identidad).subscribe((data) => {
            this.snackBar.open(`"${data.entidad}" eliminado.`, 'Cerrar');
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

    const dialogRef = this._matDialog.open(ContactoShowComponent, {
      panelClass: 'contacto-show-dialog',
      data: {
        dialogTitle: 'Cliente',
        identidad: item.identidad
      }
    });

    dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (response === 'edit') {
          this.editEntidad(item.identidad);
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
    const valor = user ? user.entidad : null;
    return valor;
  }

  resetForm(): void {
    this.cliente.setValue('');
  }

}
