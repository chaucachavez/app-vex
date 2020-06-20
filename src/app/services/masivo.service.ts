import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root'
})
export class MasivoService extends ServiceBase {

  constructor(
    public http: HttpClient,
    private _utils: Utils
  ) {
    super();
    console.log('MasivoService listo!');
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('masivos', params).pipe(
      map(data => {
        data.data.forEach(item => {
          item.fechaemision = this._utils.convertDate(item.fechaemision);

          if (item.fechavencimiento) {
            item.fechavencimiento = this._utils.convertDate(item.fechavencimiento);
          }
        });
        return data;
      })
    );
  }

  show(id: number, params?: any): Observable<any> {
    return this.getQuery(`masivos/${id}`, params).pipe(
      map(data => {
        data.data.fechaemision = this._utils.convertDate(data.data.fechaemision);
        return data.data;
      })
    );
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('masivos', objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  anular(id: number, objeto?: any): Observable<any> {
    return this.postQuery(`masivos/anular/${id}`, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

}
