import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Utils } from './utils';
import { saveAs } from 'file-saver';
import { URL_SERVICIOS } from '../config/config';
import { EntidadService } from './entidad.service';

@Injectable({
  providedIn: 'root'
})
export class VentaService extends ServiceBase {

  constructor(
    public http: HttpClient, private _utils: Utils,
    private _entidadService: EntidadService,
  ) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('ventas', params);
  }

  show(id: number, params?: any): Observable<any> {
    return this.getQuery(`ventas/${id}`, params).pipe(
      map(item => {
        item.data.fechaemision = this._utils.convertDate(item.data.fechaemision);

        if (item.data.fechavencimiento) {
          item.data.fechavencimiento = this._utils.convertDate(item.data.fechavencimiento);
        }

        if (item.data.pdf) {
          item.data.pdf = URL_SERVICIOS + '/empresa/' + this._entidadService.settings['idempresa'] + '/pdf/' + item.data.pdf;
        }

        if (item.data.xml) {
          item.data.xml = URL_SERVICIOS + '/empresa/' + this._entidadService.settings['idempresa'] + '/xml/' + item.data.xml;
        }

        if (item.data.cdr) {
          item.data.cdr = URL_SERVICIOS + '/empresa/' + this._entidadService.settings['idempresa'] + '/cdr/' + item.data.cdr;
        }

        return item;
      })
    );
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('ventas', objeto).pipe(
      map(data => {
        // swal('Registro grabado', `Venta ${data.data.serie} - ${data.data.numero} a sido creado`, 'success');
        return data.data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`ventas/${id}`, objeto).pipe(
      map(data => {
        // swal('Registro actualizado', `Venta ${data.data.serie} - ${data.data.numero} a sido actualizado`, 'success');
        return true;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`ventas/${id}`, objeto).pipe(
      map(data => {
        // swal('Eliminado!', `Venta ${data.data.serie} - ${data.data.numero} a sido eliminado`, 'success');
        return true;
      })
    );
  }

  anular(id: number, objeto?: any): Observable<any> {
    return this.postQuery(`ventas/anular/${id}`, objeto).pipe(
      map(data => {
        // swal('Registro actualizado', `Venta ${data.data.serie} - ${data.data.numero} a sido actualizado`, 'success');
        return true;
      })
    );
  }

  comprobantElectronico(id: number): Observable<any> {
    return this.getQuery(`ventas/${id}'/comprobantelectronico`);
  }

  regenerarPdf(id: number, params?: any): Observable<any> {
    return this.getQuery(`ventas/regenerar-pdf/${id}`, params).pipe(
      map(item => {
        return item;
      })
    );
  }

  estadoAnulacion(id: number, params?: any): Observable<any> {
    return this.getQuery(`ventas/estado-anulacion/${id}`, params).pipe(
      map(item => {
        return item;
      })
    );
  }

  estadoComprobante(id: number, params?: any): Observable<any> {
    return this.getQuery(`ventas/estado-comprobante/${id}`, params).pipe(
      map(item => {
        return item;
      })
    );
  }

  correoEnvio(id: number, objeto?: any): Observable<any> {
    return this.postQuery(`ventas/correo-envio/${id}`, objeto).pipe(
      map(data => {
        // swal('Registro actualizado', `Venta ${data.data.serie} - ${data.data.numero} a sido actualizado`, 'success');
        return true;
      })
    );
  }

  // Exportaciones
  exportXml(objeto: any): Observable<any> {
    return this.postDownload('ventas/savexml', objeto);
  }

  exportExcel(objeto: any): Observable<any> {
    return this.postDownload('ventas/export/excel', objeto);
  }

  downloadProxy(url): Observable<any> {
    return this.getDownloadProxy(url);
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
    return this.getQuery('ventas', state).pipe(
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
