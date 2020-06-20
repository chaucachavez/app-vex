import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { saveAs } from 'file-saver';
import { VentaService } from 'src/app/services/venta.service';
import icCallMade from '@iconify/icons-ic/twotone-call-made';
import icPrint from '@iconify/icons-ic/twotone-print';
import icClose from '@iconify/icons-ic/twotone-close';
import icCloudDownload from '@iconify/icons-ic/twotone-cloud-download';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-ventas-pdf',
  templateUrl: './ventas-pdf.component.html',
  styleUrls: ['./ventas-pdf.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasPdfComponent implements OnInit {
  loading: boolean;
  venta: any;
  dialogRef: any;

  icCallMade = icCallMade;
  icPrint = icPrint;
  icClose = icClose;
  icCloudDownload = icCloudDownload;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<VentasPdfComponent>,
    private _ventaService: VentaService
  ) {
    this.show();
  }

  ngOnInit(): void {
  }

  show(): void {
    this.venta = this.data.venta;
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
    const fileName = pdf.split('/').reverse()[0];
    const dir = pdf.split('/').reverse()[1];

    if (pdf.indexOf('www.pse.pe') === -1) {
      url = '/apiifact/public/' + dir + '/' + fileName;
    }

    if (pdf.indexOf('www.pse.pe') !== -1) {
      url = '/' + dir + '/' + fileName;
    }

    return url;
  }
}
