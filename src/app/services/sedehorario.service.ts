import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs'; 
import { map } from 'rxjs/operators';
// import swal from 'sweetalert';

@Injectable({
  providedIn: 'root'
})
export class SedehorarioService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('sedehorarios', params);
  }

  show(id: string, params?: any): Observable<any> {
    return this.getQuery(`sedehorarios/${id}`, params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('sedehorarios', objeto).pipe(
      map(data => {
        // swal('Registro grabado', data.data.nombre, 'success');
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`sedehorarios/${id}`, objeto).pipe(
      map(data => { 
        // swal('Registro actualizado', data.data.nombre, 'success');
        return true;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`sedehorarios/${id}`, objeto).pipe(
      map(data => { 
        // swal('Eliminado!', `${data.data.nombre} a sido eliminado`  , 'success');
        return true;
      })
    );
  }

}
