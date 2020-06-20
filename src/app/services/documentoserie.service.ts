import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import swal from 'sweetalert';

@Injectable({
  providedIn: 'root'
})
export class DocumentoserieService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
    console.log('DocumentoserieService listo!');
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('documentoseries', params);
  }

  show(id: string, params?: any): Observable<any> {
    return this.getQuery(`documentoseries/${id}`, params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('documentoseries', objeto).pipe(
      map(data => {
        // swal('Registro grabado', `Serie creado`, 'success');
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`documentoseries/${id}`, objeto).pipe(
      map(data => {
        // swal('Registro actualizado', `Serie actualizado`, 'success');
        return data;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`documentoseries/${id}`, objeto).pipe(
      map(data => {
        // swal('Eliminado!', `Serie a sido eliminado`, 'success');
        return data;
      })
    );
  }

}
