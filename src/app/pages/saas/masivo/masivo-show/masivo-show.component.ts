import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import icEdit from '@iconify/icons-ic/twotone-edit';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icClose from '@iconify/icons-ic/twotone-close';
import icPrint from '@iconify/icons-ic/twotone-print';
import icDomain from '@iconify/icons-ic/twotone-domain';
import icToday from '@iconify/icons-ic/twotone-today';
import icInsertDriveFile from '@iconify/icons-ic/twotone-insert-drive-file';
import icCloudDownload from '@iconify/icons-ic/twotone-cloud-download';
import icBlock from '@iconify/icons-ic/twotone-block';
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icCallMade from '@iconify/icons-ic/twotone-call-made';
import { VentaService } from 'src/app/services/venta.service';
import { MasivoService } from 'src/app/services/masivo.service';
import { URL_SERVICIOS } from 'src/app/config/config';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-masivo-show',
  templateUrl: './masivo-show.component.html',
  styleUrls: ['./masivo-show.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MasivoShowComponent implements OnInit {

  // Formulario
  masivo: any;
  loading: boolean;

  // Constantes
  URL_PDF = URL_SERVICIOS + '/pdf-masivo/';

  // Iconos
  icEdit = icEdit;
  icBlock = icBlock;
  icClose = icClose;
  icPrint = icPrint;
  icToday = icToday;
  icDomain = icDomain;
  icDelete = icDelete;
  icMoreVert = icMoreVert;
  icCallMade = icCallMade;
  icCloudDownload = icCloudDownload;
  icInsertDriveFile = icInsertDriveFile;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<MasivoShowComponent>,
    private _ventaService: VentaService,
    private _masivoService: MasivoService
  ) {

  }

  ngOnInit(): void {
    this.show();
  }

  show(): void {
    this.loading = true;
    this._masivoService.show(this.data.id, { conRecurso: 'sede,masivodet,ventas.docnegocio' })
      .subscribe((data: any) => {
        this.masivo = data;

        this.masivo.ventas.forEach(row => {
          row.pdf = this.urlPdf(row.pdf);
        });

        this.loading = false;
      }, (error) => {
        this.loading = false;
      });
  }

  downloadFile(file: string): void {

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
        url = '/apiifact/public/' + dir + '/' + fileName;
      }

      if (pdf.indexOf('www.pse.pe') !== -1) {
        url = '/' + dir + '/' + fileName;
      }
    }

    return url;
  }
}
