import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('categorias', params);
  }

  show(id: string, params?: any): Observable<any> {
    return this.getQuery(`categorias/${id}`, params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('categorias', objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`categorias/${id}`, objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`categorias/${id}`, objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

}
