import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SedeService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('sedes', params);
  }

  show(id: string, params?: any): Observable<any> {
    return this.getQuery(`sedes/${id}`, params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('sedes', objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`sedes/${id}`, objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`sedes/${id}`, objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

}
