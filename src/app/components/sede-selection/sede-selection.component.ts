import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EntidadService } from '../../services/entidad.service';
import icClose from '@iconify/icons-ic/twotone-close';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'vex-sede-selection',
  templateUrl: './sede-selection.component.html',
  styleUrls: ['./sede-selection.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SedeSelectionComponent implements OnInit {

  sedeForm: FormGroup;
  sedes: any[];

  icClose = icClose;
  exit = false;

  favoriteSeason = new FormControl();

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<SedeSelectionComponent>,
    public _entidadService: EntidadService
  ) {
    this.sedes = _data.sedes;
    this.exit = _data.salir;
  }

  ngOnInit(): void {
    this.sedeForm = this.createCicloForm();
  }

  createCicloForm(): FormGroup {
    return new FormGroup({
      idsede: new FormControl('', [Validators.required])
    });
  }

  save(): void {
    const param = this.sedeForm.getRawValue();
    this._entidadService.setSede(param.idsede);
    this.matDialogRef.close(true);
  }

  salir(): void {
    this.matDialogRef.close('salir');
  }
}
