import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UbigeoService extends ServiceBase {

  constructor(public http: HttpClient) {
    super();
  }

  // Metodos
  // getDepartamentos(pais: string) {
  //   return this.getQuery(`departamentos`);
  // }

  // getProvincias(pais: string, departamento: string) {
  //   return this.getQuery(`departamentos/${departamento}/provincias`);
  // }

  // getDistritos(pais: string, departamento: string, provincia: string) {
  //   return this.getQuery(`departamentos/${departamento}/provincias/${provincia}/distritos`);
  // }

  // Metodos
  departamentos(params?: any): Observable<any> {
    return this.getQuery('departamentos', params);
  }

  provincias(params?: any): Observable<any> {
    return this.getQuery('provincias', params);
  }

  distritos(params?: any): Observable<any> {
    return this.getQuery('distritos', params);
  }


}
