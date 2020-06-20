import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { VentaService } from 'src/app/services/venta.service';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icBlock from '@iconify/icons-ic/twotone-block';
import icPrint from '@iconify/icons-ic/twotone-print';
import icClose from '@iconify/icons-ic/twotone-close';
import icCallMade from '@iconify/icons-ic/twotone-call-made';
import icCloudDownload from '@iconify/icons-ic/twotone-cloud-download';
import icMail from '@iconify/icons-ic/twotone-mail';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icInsertDriveFile from '@iconify/icons-ic/twotone-insert-drive-file';
import icAutorenew from '@iconify/icons-ic/twotone-autorenew';
import icCheck from '@iconify/icons-ic/twotone-check';

import { Utils } from 'src/app/services/utils';
import { EntidadService } from 'src/app/services/entidad.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';


@Component({
  selector: 'vex-venta-show',
  templateUrl: './venta-show.component.html',
  styleUrls: ['./venta-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentaShowComponent implements OnInit, AfterViewInit {

  @ViewChild('tabGroup', { static: false }) tabGroup: any;
  public activeTabIndex: number | undefined = undefined;

  loading: boolean;
  venta: any;
  dialogRef: any;
  botones: any;

  icEdit = icEdit;
  icBlock = icBlock;
  icPrint = icPrint;
  icClose = icClose;
  icCallMade = icCallMade;
  icCloudDownload = icCloudDownload;
  icMail = icMail;
  icMoreVert = icMoreVert;
  icInsertDriveFile = icInsertDriveFile;
  icAutorenew = icAutorenew;
  icCheck = icCheck;

  submitted = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<VentaShowComponent>,
    private _matDialog: MatDialog,
    private _ventaService: VentaService,
    private _utils: Utils,
    private snackBar: MatSnackBar,
    private _entidadService: EntidadService
  ) {
    this.show();
    this.botones = data.botones;
    console.log(this.botones);
  }

  ngOnInit(): void {
    // console.log('ngOnInit');
  }

  ngAfterViewInit(): void {
    // this.activeTabIndex = this.tabGroup.selectedIndex; //No me funciona
    if (this.data.pestana === 'COMPROBANTE') {
      this.activeTabIndex = 1;
    } else {
      this.activeTabIndex = 0;
    }
  }

  public handleTabChange(e: MatTabChangeEvent) {
    this.activeTabIndex = e.index;
  }

  show(): void {
    this.loading = true;
    this._ventaService.show(this.data.idventa, { conRecurso: 'ventadet.producto,creacion,modificacion' })
      .subscribe((data: any) => {

        this.venta = data.data;
        console.log('this.venta', this.venta);
        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
  }

  estadoAnulacion(idventa: number): void {
    this.submitted = true;
    this._ventaService.estadoAnulacion(idventa).subscribe((data) => {
      this.venta['sunat_anulado_aceptado'] = '1';
      this.submitted = false;
      this.snackBar.open(data.data, 'Cerrar');
    }, error => {
      this.submitted = false;
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  estadoComprobante(idventa: number): void {
    this.submitted = true;
    this._ventaService.estadoComprobante(idventa).subscribe((data) => {
      this.venta['sunat_aceptado'] = '1';
      this.submitted = false;
      this.snackBar.open(data.data, 'Cerrar');
    }, error => {
      this.submitted = false;
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  downloadFile(file: string): void {
    const url = this.urlPdf(file);
    this._ventaService.downloadProxy(url).subscribe((data) => {
      const fileName = file.split('/').reverse()[0];
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

    console.log(pdf);
    const fileName = pdf.split('/').reverse()[0];
    const dir = pdf.split('/').reverse()[1];

    // AHORA
    if (location.hostname === 'localhost') {
      return '/empresa/' + this._entidadService.settings['idempresa'] + '/' + dir + '/' + fileName;
    } else {
      // https://app.centromedicoosi.com/api/public/empresa/27/pdf/20601285101-03-B001-2.pdf
      return '/api/public/empresa/' + this._entidadService.settings['idempresa'] + '/' + dir + '/' + fileName;
    }

    // ANTES http://app.centromedicoosi.com/api/public/pdf/20431738806-03-B001-6.pdf
    // let url = '';
    // const fileName = pdf.split('/').reverse()[0];
    // const dir = pdf.split('/').reverse()[1];

    // if (pdf.indexOf('www.pse.pe') === -1) {
    //   url = '/api/public/' + dir + '/' + fileName;
    // }

    // if (pdf.indexOf('www.pse.pe') !== -1) {
    //   url = '/' + dir + '/' + fileName;
    // }

    // return url;
  }
}
