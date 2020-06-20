import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { VentasDescargaComponent } from './ventas-descarga/ventas-descarga.component';
import { VentasPdfComponent } from './ventas-pdf/ventas-pdf.component';
import { Router } from '@angular/router';
import { EntidadService } from 'src/app/services/entidad.service';
import { VentaService } from 'src/app/services/venta.service';
import { Utils } from 'src/app/services/utils';
import { VentaShowComponent } from 'src/app/components/venta/venta-show/venta-show.component';
import { VentaDowloandComponent } from 'src/app/components/venta/venta-dowloand/venta-dowloand.component';
import { VentasAnularComponent } from 'src/app/components/venta/ventas-anular/ventas-anular.component';
import { VentasCorreoComponent } from 'src/app/components/venta/ventas-correo/ventas-correo.component';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAdd from '@iconify/icons-ic/twotone-add';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icCloudDownload from '@iconify/icons-ic/twotone-cloud-download';
import icCheck from '@iconify/icons-ic/twotone-check';
import icCheckBoxOutlineBlank from '@iconify/icons-ic/twotone-check-box-outline-blank';
import icAutorenew from '@iconify/icons-ic/twotone-autorenew';
import icPeople from '@iconify/icons-ic/twotone-people';
import icFilterList from '@iconify/icons-ic/twotone-filter-list';
import icPictureAsPdf from '@iconify/icons-ic/twotone-picture-as-pdf';
import icInsertDriveFile from '@iconify/icons-ic/twotone-insert-drive-file';
import icMail from '@iconify/icons-ic/twotone-mail';
import icBlock from '@iconify/icons-ic/twotone-block';
import icPrint from '@iconify/icons-ic/twotone-print';
import { VentasRegenerarComponent } from './ventas-regenerar/ventas-regenerar.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'vex-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasComponent implements OnInit {

  pipeDate = new DatePipe('es-Pe');

  /* BUSCARDOR PERSONA */
  searchResult = { data: null, to: null, total: null };
  isLoadingSearch = false;
  /* BUSCARDOR PERSONA */

  /* FILTROS */
  idsede = new FormControl();
  fechaemisionFrom = new FormControl();
  fechaemisionTo = new FormControl();
  cliente = new FormControl();

  filterForm: FormGroup;
  searchForm: FormGroup;
  /* SEARCH */

  icSearch = icSearch;
  icAdd = icAdd;
  icEdit = icEdit;
  icDelete = icDelete;
  icClose = icClose;
  icVisibility = icVisibility;
  icCheckBoxOutlineBlank = icCheckBoxOutlineBlank;
  icCheck = icCheck;
  icAutorenew = icAutorenew;
  icPeople = icPeople;
  icMoreVert = icMoreVert;
  icCloudDownload = icCloudDownload;
  icFilterList = icFilterList;
  icPictureAsPdf = icPictureAsPdf;
  icInsertDriveFile = icInsertDriveFile;
  icMail = icMail;
  icBlock = icBlock;
  icPrint = icPrint;

  /* GRID */
  dcVenta: string[] = ['acciones', 'fechaemision',
    'numerodoc', 'entidad', 'iddocumentofiscal', 'serie', 'numero', 'idestadodocumento', 'total', 'sunat', 'estado'];
  dsVenta = new MatTableDataSource();
  loadVenta = true;
  rLengthVenta = 0;
  pSizeVenta = 20;
  pSizeOptVenta: number[] = [10, 20, 50];
  @ViewChild('pagVenta', { static: true }) pagVenta: MatPaginator;
  @ViewChild('sortVenta', { static: true }) sortVenta: MatSort;
  /* GRID */

  constructor(
    private router: Router,
    private _matDialog: MatDialog,
    private _entidadService: EntidadService,
    private _ventaService: VentaService,
    private _utils: Utils,
    private snackBar: MatSnackBar
  ) {
    this.idsede.setValue(this._entidadService.sedeDefault || '');
  }

  ngOnInit(): void {
    this.searchForm = this.createSearchForm();

    this.searchForm.controls['iddocumentofiscal'].valueChanges
      .subscribe(data => {
        console.log('searchForm iddocumentofiscal', data);
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
              orderName: 'entidad',
              orderSort: 'asc'
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

    this.sortVenta.sortChange.subscribe(() => {
      this.pagVenta.pageIndex = 0;
      this.index();
    });

    this.pagVenta.page.subscribe(() => {
      this.index();
    });

    this.index();
  }

  createSearchForm(): FormGroup {
    return new FormGroup({
      iddocumentofiscal: new FormControl(),
      serie: new FormControl(),
      numero: new FormControl()
    });
  }

  index(filterSearch?: boolean): void {

    if (filterSearch) {
      this.pagVenta.pageIndex = 0;
    }

    const param = {
      page: this.pagVenta.pageSize ? (this.pagVenta.pageIndex + 1) : 1,
      pageSize: this.pagVenta.pageSize ? this.pagVenta.pageSize : this.pSizeVenta,
      orderName: this.sortVenta.active ? this.sortVenta.active : 'idventa',
      orderSort: this.sortVenta.direction ? this.sortVenta.direction : 'desc',
      conRecurso: 'sede,docnegocio'
    };

    if (this.idsede.value) {
      param['idsede'] = this.idsede.value;
    }

    if (this.fechaemisionFrom.value) {
      param['fechaemisionFrom'] = this.pipeDate.transform(this.fechaemisionFrom.value, 'yyyy-MM-dd');
    }

    if (this.fechaemisionTo.value) {
      param['fechaemisionTo'] = this.pipeDate.transform(this.fechaemisionTo.value, 'yyyy-MM-dd');
    }

    if (this.cliente.value) {
      param['idcliente'] = this.cliente.value.identidad;
    }

    const searchRaw = this.searchForm.getRawValue();
    this.clean(searchRaw);

    Object.assign(param, searchRaw);

    this.loadVenta = true;
    this._ventaService.index(param)
      .subscribe((data: any) => {
        data.data.forEach(row => {
          row.pdf = this.urlPdf(row.pdf);
        });

        this.dsVenta.data = data.data;
        this.loadVenta = false;
        this.rLengthVenta = data.total;
        console.log('this.rLengthVenta', this.rLengthVenta);
      }, error => {
        this.loadVenta = false;
        const message = this._utils.convertError(error);
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
  }

  clean(obj: any): void {
    // https://stackoverrun.com/es/q/38562
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '') {
        delete obj[propName];
      }
    }
  }

  showVenta(venta, pestana?: string): void {
    const dialogRef = this._matDialog.open(VentaShowComponent, {
      panelClass: 'venta-show-dialog',
      data: {
        idventa: venta.idventa,
        pestana,
        botones: {
          canu: false, // consultar anulacion
          rpdf: false, // regenerar pdf
          nvent: true, // nueva venta
          edit: false, // editar
          anu: true, // anular
          mail: true, // enviar
          nc: false, // nota de credito
          nd: false, // nota de débito
          gr: true // guia de remision
        }
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe((response) => {
        console.log('response: ', response);
        if (!response) {
          return;
        }
        if (response === 'anular') {
          this.anularVenta(venta);
        }

        if (response === 'correo') {
          this.correoVenta(venta);
        }

        if (response === 'regenerar') {
          this.regenerarPDF(venta);
        }

        if (response === 'Notadecredito') {
          this.nuevoComprobante(venta, 'Notadecredito');
        }

        if (response === 'Notadedebito') {
          this.nuevoComprobante(venta, 'Notadecredito');
        }
      });
  }

  downloadVenta(): void {
    const dialogRef = this._matDialog.open(VentaDowloandComponent, {
      panelClass: 'venta-download-dialog',
      data: {

      }
    });

    dialogRef.afterClosed()
      .subscribe((response) => {
        if (!response) {
          return;
        }
      });
  }

  descargar(): void {
    const dialogRef = this._matDialog.open(VentasDescargaComponent, {
      panelClass: 'venta-descarga-dialog',
      data: {
        item: null
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }

        this.index();
      });
  }

  pdf(venta): void {
    const dialogRef = this._matDialog.open(VentasPdfComponent, {
      panelClass: 'venta-pdf-dialog',
      data: {
        venta
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }

        this.index();
      });
  }

  anularVenta(venta: any): void {
    const dialogRef = this._matDialog.open(VentasAnularComponent, {
      panelClass: 'ventasanular-form-dialog',
      data: {
        venta
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }

        this.index();
      });
  }

  correoVenta(venta: any): void {
    const dialogRef = this._matDialog.open(VentasCorreoComponent, {
      panelClass: 'ventascorreo-form-dialog',
      data: {
        venta
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }

        this.index();
      });
  }

  regenerarPDF(venta: any): void {
    const dialogRef = this._matDialog.open(VentasRegenerarComponent, {
      panelClass: 'ventasregenerar-form-dialog',
      data: {
        venta
      },
      autoFocus: false
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }

        this.index();
        this.showVenta(venta, 'COMPROBANTE');
      });
  }

  displaySearchEntidad(user?): string | null {
    const valor = user ? user.entidad : null;
    return valor;
  }

  nuevoComprobante(item: any, documento?: any): void {

    if (!documento) {
      switch (item.iddocumentofiscal) {
        case 1:
          documento = 'Factura';
          break;
        case 2:
          documento = 'Boletadeventa';
          break;
        case 13:
          documento = 'Notadecredito';
          break;
        case 10:
          documento = 'Notadedebito';
          break;
        default:
          break;
      }
    }

    this.router.navigate(['/ventas/emitir/' + documento, { venta: item.idventa }]);
  }

  resetForm(): void {
    this.searchForm.reset({}, { emitEvent: false });
    this.index();
  }

  downloadPdf(pdf: string): void {
    const url = this.urlPdf(pdf);
    this._ventaService.downloadProxy(url).subscribe((data) => {
      const fileName = pdf.split('/').reverse()[0];
      saveAs(data, fileName);
    }, (error) => {

    });
  }

  printPdf(pdf: string): void {
    const url = this.urlPdf(pdf);
    this._ventaService.downloadProxy(url).subscribe((data) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow.print();
    }, (error) => {

    });
  }

  private urlPdf(pdf): string {
    let url = '';

    if (pdf) {
      const fileName = pdf.split('/').reverse()[0];
      const dir = pdf.split('/').reverse()[1];

      if (pdf.indexOf('www.pse.pe') === -1) {
        url = '/api/public/' + dir + '/' + fileName;
      }

      if (pdf.indexOf('www.pse.pe') !== -1) {
        url = '/' + dir + '/' + fileName;
      }
    }

    return url;
  }
}
