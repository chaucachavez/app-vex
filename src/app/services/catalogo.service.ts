import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('catalogos', params);
  }

}
