import { Injectable, Inject } from '@angular/core'; 
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  ajustes: Ajustes = {
    token: 'NA',
    user: {},
    name: 'SN'
  };

  constructor(
    @Inject(DOCUMENT) private _document,
  ) { 
    this.cargarAjustes();
  }

  guardarAjustes() {
    localStorage.setItem('ajustes', JSON.stringify(this.ajustes));
  }


  cargarAjustes() {
    if (localStorage.getItem('ajustes')) {
      this.ajustes = JSON.parse(localStorage.getItem('ajustes'));
      console.log('cargando del localstorage');
    } else {
      console.log('Usando por defecto localstorage');
    } 

    this.aplicarTema(this.ajustes.name);
  }

  aplicarTema(tema: string) {
    this._document.getElementById('tema').innerHTML = tema;

    this.ajustes.name = tema;
    this.guardarAjustes();
  }

}

interface Ajustes {
  token: string,
  user: object,
  name: string
}
