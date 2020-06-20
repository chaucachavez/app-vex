import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubirArchivoService } from './subir-archivo.service';
import { URL_SERVICIOS } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class ProductoService extends ServiceBase {

  constructor(public http: HttpClient, public _subirArchivoService: SubirArchivoService) {
    super();
    console.log('ProductoService listo!');
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('productos', params);
  }

  show(id: number, params?: any): Observable<any> {
    return this.getQuery(`productos/${id}`, params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('productos', objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`productos/${id}`, objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`productos/${id}`, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  updateImg(id: number, archivo: File): any {
    return this._subirArchivoService.subirArchivo(archivo, '/productos/subirimagen/' + id);
  }

  exportExcel(objeto: any): Observable<any> {
    return this.postDownload('productos/export/excel', objeto);
  }

  exportTemplateExcel(): Observable<any> {
    return this.postDownload('productos/plantilla/excel');
  }
}

@Injectable({
  providedIn: 'root'
})
export class DataService extends Subject<any> {

  constructor(private http: HttpClient) {
    super();
  }

  public execute(state: any): Observable<any> {
    return this.getQuery('productos', state).pipe(
      map(item => {
        item['result'] = item['data'];
        item['count'] = item['total'];
        return item;
      })
    );
  }

  getQuery(query: string, param: any): Observable<any> {
    const url = URL_SERVICIOS;
    let token = '';
    if (localStorage.getItem('tokenPF')) {
      token = localStorage.getItem('tokenPF');
    }
    // console.log('getQuery', token);
    const headers = new HttpHeaders({
      Authorization: token
    });

    let params = new HttpParams();

    if (param) {
      for (let i in param) {
        params = params.append(i, String(param[i]));
      }
    }

    return this.http.get(`${url}/${query}`, { headers, params });
  }

} 
