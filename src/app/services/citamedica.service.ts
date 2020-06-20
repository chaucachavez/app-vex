import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root'
})
export class CitamedicaService extends ServiceBase {

  constructor(public http: HttpClient, private _utils: Utils) {
    super();
    console.log('CitamedicaService listo!');
  }

  // Metodos
  index(params?: any): Observable<any> {
    // "2018-06-26" "16:00:00"
    return this.getQuery('citamedicas', params).pipe(
      map(data => {
        data.data.forEach(item => {
          item.fecha_date = this._utils.convertDate(item.fecha, item.inicio);
        });

        return data;
      })
    );
  }

  show(id: number, params?: any): Observable<any> {
    return this.getQuery(`citamedicas/${id}`, params).pipe(
      map(item => {
        const inicio = this._utils.convertDate(item.data.fecha, item.data.inicio);
        const fecha = this._utils.convertDate(item.data.fecha, item.data.inicio);
        item.data.inicio = inicio;
        item.data.fecha = fecha;

        return item;
      })
    );
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('citamedicas', objeto).pipe(
      map(data => {
        const fecha = this._utils.convertDate(data.data.fecha, data.data.inicio);
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`citamedicas/${id}`, objeto).pipe(
      map(data => {
        const fecha = this._utils.convertDate(data.data.fecha, data.data.inicio);
        return data;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`citamedicas/${id}`, objeto).pipe(
      map(data => {
        const fecha = this._utils.convertDate(data.data.fecha, data.data.inicio);
        return data;
      })
    );
  }

  disponibilidad(sede: number, params?: any): Observable<any> {
    // "2018-06-26" "16:00:00"
    return this.getQuery('citamedicas/' + sede + '/disponibilidad', params).pipe(
      map(data => {
        data.data.forEach(item => {
          item.horas.forEach(cita => {
            cita.fecha_date = this._utils.convertDate(cita.fecha, cita.inicio);
          });
        });

        return data;
      })
    );
  }

}
