import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';

@Injectable({
  providedIn: 'root'
})
export class CitaterapeuticaService extends ServiceBase{

  constructor(public http: HttpClient) { 
    super();
  }

  //Metodos
  index(params: any) {
    return this.getQuery('citaterapeutas', params);
  }

  show(id: string, params?: any) {
    return this.getQuery(`citaterapeutas/${id}`, params);
  }

}
