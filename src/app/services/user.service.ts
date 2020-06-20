import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import swal from 'sweetalert';
import { SubirArchivoService } from './subir-archivo.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ServiceBase {

  constructor(public http: HttpClient, public _subirArchivoService: SubirArchivoService) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('users', params);
  }

  show(id: string, params?: any): Observable<any> {
    return this.getQuery(`users/${id}`, params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('users', objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`users/${id}`, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`users/${id}`, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  updateImg(id: number, archivo: File): void {
    this._subirArchivoService.subirArchivo(archivo, '/users/subirimagen/' + id)
      .then(data => {
        // swal('Imagen actualizada', 'Usuario', 'success');
      })
      .catch(data => {
        // console.log(data);
      });
  } 
}
