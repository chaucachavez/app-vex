import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmacionComponent implements OnInit {

  public confirmMessage: string;
  public textButton: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmacionComponent>
  ) {
    this.textButton = 'ELIMINAR';
  }

  ngOnInit(): void {
  }
}
