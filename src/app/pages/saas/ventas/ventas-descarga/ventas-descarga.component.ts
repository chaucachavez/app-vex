import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { VentaService } from 'src/app/services/venta.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'vex-ventas-descarga',
  templateUrl: './ventas-descarga.component.html',
  styleUrls: ['./ventas-descarga.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentasDescargaComponent implements OnInit {

  loading: boolean;
  venta: any;
  dialogRef: any;
  url: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<VentasDescargaComponent>,
    private _matDialog: MatDialog,
    private _ventaService: VentaService
  ) { }

  ngOnInit(): void {
    this.loading = false;
    this.url = 'http://apiifact.pe/temporal/20431738806-03-B004-1270.pdf'; // 'http://apiclinicanet.pe/temporal/s2qWQ4fJg8j6nzcw.pdf';
  }

}
