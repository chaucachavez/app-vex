import { Component, OnInit } from '@angular/core';
import icPersonAdd from '@iconify/icons-ic/twotone-person-add';
import icSearch from '@iconify/icons-ic/twotone-search';
import { trackById } from '../../../../@vex/utils/track-by';
import { stagger60ms } from '../../../../@vex/animations/stagger.animation';
import { fadeInUp400ms } from '../../../../@vex/animations/fade-in-up.animation';
import { EntidadService } from 'src/app/services/entidad.service';

@Component({
  selector: 'vex-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  animations: [
    stagger60ms,
    fadeInUp400ms
  ]
})
export class InicioComponent implements OnInit {

  trackById = trackById;
  icPersonAdd = icPersonAdd;
  icSearch = icSearch;

  sedes = [];
  modulos = [];
  sedeActual: any;

  constructor(
    private _entidadService: EntidadService,
  ) {
    this.sedes = this._entidadService.sedes;
    this.modulos = this._entidadService.modulos.filter(modulo => {
      return modulo.id !== 95; // Excepto INICIO
    });

    this.sedeActual = this.sedes.length > 0 ? this.sedes.filter(sede => sede.idsede === this._entidadService.sedeDefault)[0] : null;
  }

  ngOnInit() {
  }

}
