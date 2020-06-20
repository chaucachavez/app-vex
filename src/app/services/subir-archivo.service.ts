import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class SubirArchivoService {

  constructor() {

  }

  public subirArchivo(archivo: File, uri: string, param?: any): Promise<any> {

    return new Promise((resolve, reject) => {
      let token = '';
      if (localStorage.getItem('tokenPF')) {
        token = localStorage.getItem('tokenPF');
      }

      const formData = new FormData();
      const xhr = new XMLHttpRequest();

      console.log(archivo, archivo.name);
      formData.append('imagen', archivo, archivo.name);


      if (param) {
        formData.append(param.key, param.value);
      }

      xhr.onreadystatechange = function(): void {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log('Imagen subida');
            resolve(JSON.parse(xhr.response));
          } else {
            console.log('Falló la subida');
            reject(xhr.response);
          }
        }
      };

      const url = URL_SERVICIOS + uri;
      // xhr.open('PUT', url, true);
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', token);
      xhr.send(formData);
    });
  }
}
