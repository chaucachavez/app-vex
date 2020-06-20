import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';

@Injectable({
  providedIn: 'root'
})
export class HoraService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  //Metodos
  index(params?: any) {
    return this.getQuery('horas', params);
  }

}
