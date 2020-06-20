import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Utils } from './utils';

@Injectable({
  providedIn: 'root'
})
export class CicloService extends ServiceBase {

  constructor(public http: HttpClient, private _utils: Utils) {
    super();
    console.log('CicloService listo!');
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('ciclos', params).pipe(
      map(data => {
        data.data.forEach(item => {
          item.fecha = this._utils.convertDate(item.fecha);
        });

        return data;
      })
    );
  }

  show(id: string, params?: any): Observable<any> {
    return this.getQuery(`ciclos/${id}`, params).pipe(
      map(item => {

        if (item.data.fecha) {
          item.data.fecha = this._utils.convertDate(item.data.fecha);
        }

        return item;
      })
    );
  }

}
