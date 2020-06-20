import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstadoService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('estados', params);
  }

  show(id: string, params?: any): Observable<any> {
    return this.getQuery(`estados/${id}`, params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('estados', objeto).pipe(
      map(data => {
        // swal('Registro grabado', data.data.nombre, 'success');
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`estados/${id}`, objeto).pipe(
      map(data => { 
        // swal('Registro actualizado', data.data.nombre, 'success');
        return true;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`estados/${id}`, objeto).pipe(
      map(data => { 
        // swal('Eliminado!', `${data.data.nombre} a sido eliminado`  , 'success');
        return true;
      })
    );
  }

}
