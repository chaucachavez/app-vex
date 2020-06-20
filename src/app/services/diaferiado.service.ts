import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiaferiadoService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('diasferiados', params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('diasferiados', objeto).pipe(
      map(data => {
        // swal('Registro grabado', data.data.fecha, 'success');
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`diasferiados/${id}`, objeto).pipe(
      map(data => { 
        // swal('Registro actualizado', data.data.fecha, 'success');
        return true;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`diasferiados/${id}`, objeto).pipe(
      map(data => { 
        // swal('Eliminado!', `${data.data.fecha} a sido eliminado`  , 'success');
        return true;
      })
    );
  }

}
