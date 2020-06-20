import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MasivoService } from 'src/app/services/masivo.service';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icCheck from '@iconify/icons-ic/twotone-check';
import icBlock from '@iconify/icons-ic/twotone-block';
import icPrint from '@iconify/icons-ic/twotone-print';
import icPictureAsPdf from '@iconify/icons-ic/twotone-picture-as-pdf';
import icCloudDownload from '@iconify/icons-ic/twotone-cloud-download';
import { Utils } from 'src/app/services/utils';
import { MasivoShowComponent } from './masivo-show/masivo-show.component';
import { MasivoFormComponent } from './masivo-form/masivo-form.component';
import { ConfirmacionComponent } from 'src/app/components/confirmacion/confirmacion.component';
import { FormControl, Validators } from '@angular/forms';
import { EntidadService } from 'src/app/services/entidad.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'vex-masivo',
  templateUrl: './masivo.component.html',
  styleUrls: ['./masivo.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasivoComponent implements OnInit {

  // Grid masivo
  dcMasivo: string[] = ['acciones', 'sede', 'fechaemision', 'iddocumentofiscal', 'serie', 'cantidad', 'detalle']; // numerodel
  dsMasivo = new MatTableDataSource();
  loadMasivo = true;
  rLengthMasivo = 0;
  pSizeMasivo = 50;
  pSizeOptMasivo: number[] = [10, 20, 50];
  @ViewChild('pagMasivo', { static: true }) pagMasivo: MatPaginator;
  @ViewChild('sortMasivo', { static: true }) sortMasivo: MatSort;
  pipeDate = new DatePipe('es-Pe');

  // Filtros
  sedes = [];
  sede = new FormControl();
  fechaemisionFrom = new FormControl();
  fechaemisionTo = new FormControl();

  // Iconos
  icAdd = icAdd;
  icEdit = icEdit;
  icClose = icClose;
  icCheck = icCheck;
  icBlock = icBlock;
  icPrint = icPrint;
  icDelete = icDelete;
  icSearch = icSearch;
  icVisibility = icVisibility;
  icPictureAsPdf = icPictureAsPdf;
  icCloudDownload = icCloudDownload;

  constructor(
    private _matDialog: MatDialog,
    private _masivoService: MasivoService,
    private _entidadService: EntidadService,
    private _utils: Utils,
    private snackBar: MatSnackBar
  ) {
    this.sedes = this._entidadService.sedes;
    this.sede.setValue('');
  }

  ngOnInit(): void {

    this.sede.valueChanges
      .subscribe(value => {
        console.log('sede', value);
        this.index();
      });

    this.fechaemisionFrom.valueChanges
      .subscribe(data => {
        this.index();
      });

    this.fechaemisionTo.valueChanges
      .subscribe(data => {
        this.index();
      });

    this.sortMasivo.sortChange.subscribe(() => {
      this.pagMasivo.pageIndex = 0;
      this.index();
    });

    this.pagMasivo.page.subscribe(() => {
      this.index();
    });

    this.index();
  }

  index(filterSearch?: boolean): void {
    if (filterSearch) {
      this.pagMasivo.pageIndex = 0;
    }

    const param = {
      page: this.pagMasivo.pageSize ? (this.pagMasivo.pageIndex + 1) : 1,
      pageSize: this.pagMasivo.pageSize ? this.pagMasivo.pageSize : this.pSizeMasivo,
      orderName: this.sortMasivo.active ? this.sortMasivo.active : 'id',
      orderSort: this.sortMasivo.direction ? this.sortMasivo.direction : 'desc',
      conRecurso: 'docnegocio,sede,masivodet'
    };

    if (this.sede.value) {
      param['idsede'] = this.sede.value;
    }

    if (this.fechaemisionFrom.value) {
      param['fechaemisionFrom'] = this.pipeDate.transform(this.fechaemisionFrom.value, 'yyyy-MM-dd');
    }

    if (this.fechaemisionTo.value) {
      param['fechaemisionTo'] = this.pipeDate.transform(this.fechaemisionTo.value, 'yyyy-MM-dd');
    }

    this.loadMasivo = true;
    this._masivoService.index(param)
      .subscribe((data: any) => {
        data.data.forEach(row => {
          row.progressbar = (row.progreso * 100) / row.cantidad;
        });
        this.loadMasivo = false;
        this.dsMasivo.data = data.data;
        this.rLengthMasivo = data.total;

      }, error => {
        // swal('Upss!', error.error.error, 'error');
      });
  }

  newMasivo(): void {

    const dialogRef = this._matDialog.open(MasivoFormComponent, {
      panelClass: 'masivo-form-dialog',
      data: {
        sedeDefault: this.sede.value ? this.sede.value : this._entidadService.sedeDefault
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }

        // Solo en caso el cliente haya emitido por otra sede
        if (this.sede.value && this.sede.value !== response.idsede) {
          this.sede.setValue(response.idsede, { emitEvent: false });
        }

        this.showMasivo(response);
        this.index();
      });
  }

  anularMasivo(item: any): void {
    const dialogRef = this._matDialog.open(ConfirmacionComponent, {
      panelClass: 'confirmacion-dialog',
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = `¿Estas seguro de anular los ${item.cantidad} comprobantes?`;
    dialogRef.componentInstance.textButton = `ANULAR`;

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result) {
          this.snackBar.open(`Procesando...`, 'Cerrar');
          this._masivoService.anular(item.id).subscribe((data) => {
            this.snackBar.open(`${data.cantidad} comprobantes anulados.`, 'Cerrar');
            this.index();
            this.showMasivo(item);
          },
            error => {
              const message = this._utils.convertError(error);
              this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
            });
        }
      });
  }

  showMasivo(item: any): void {
    const dialogRef = this._matDialog.open(MasivoShowComponent, {
      panelClass: 'masivo-show-dialog',
      data: {
        id: item.id
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }

        if (response === 'anular') {
          this.anularMasivo(item);
        }

        if (response === 'refresh') {
          this.index(true);
        }
      });
  }

  displaySearchMasivo(item?): string | null {
    const valor = item ? item.nombre : null;
    return valor;
  }

  printPdf(pdf: string): void {
  }
}
