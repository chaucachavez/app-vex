import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModuloService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('modulos', params).pipe(
      map(data => {
        return data;
      })
    );
  }

  nuevoModulo(objeto: any): Observable<any> {
    return this.postQuery('modulos', objeto).pipe(
      map(data => {
        // swal('Registro grabado', data.data.nombre, 'success');
        return data;
      })
    );
  }

  actualizarModulo(id: number, objeto: any): Observable<any> {
    return this.putQuery(`modulos/${id}`, objeto).pipe(
      map(data => {
        // swal('Registro actualizado', data.data.nombre, 'success');
        return true;
      })
    );
  }

  // Metodos
  modulosEmpresa(): Observable<any> {
    return this.getQuery(`modulos/empresa/lista`).pipe(
      map(data => {
        return data.data;
      })
    );
  }

}
