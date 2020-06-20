import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { VentaService } from '../../../../app/services/venta.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'vex-venta-dowloand',
  templateUrl: './venta-dowloand.component.html',
  styleUrls: ['./venta-dowloand.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VentaDowloandComponent implements OnInit {

  loading: boolean;
  venta: any;
  dialogRef: any;
  url: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<VentaDowloandComponent>,
    private _matDialog: MatDialog,
    private _ventaService: VentaService
  ) { }

  ngOnInit(): void {
    this.loading = false;
    this.url = 'temporal/s2qWQ4fJg8j6nzcw.pdf'; // 'http://apiclinicanet.pe/temporal/s2qWQ4fJg8j6nzcw.pdf';
  }
}
