import { Pipe, PipeTransform } from '@angular/core';
import { URL_SERVICIOS } from '../config/config';
import { EntidadService } from '../services/entidad.service';

@Pipe({
  name: 'imagen'
})
export class ImagenPipe implements PipeTransform {

  constructor(public _entidadService: EntidadService
  ) {
  }

  transform(img: string, empty?: string): any {

    let url;

    if (!img) {
      return url = URL_SERVICIOS + '/img_default/profile.jpg';
      // switch (empty) {
      //   case 'F':
      //     return url + 'femenino.png';
      //     break;
      //   case 'M':
      //     return url + 'masculino.png';
      //     break;
      //   case 'Item':
      //     return url + 'item.png';
      //     break;
      //   default:
      //     return url + 'profile.jpg';
      //     break;
      // }
    }

    if (empty === 'empresa') {
      url = URL_SERVICIOS + '/empresa/' + this._entidadService.usuario.idempresa + '/img/' + img;
    } else {
      url = URL_SERVICIOS + '/persona/' + this._entidadService.usuario.id + '/' + img;
    }

    return url;
  }
}
