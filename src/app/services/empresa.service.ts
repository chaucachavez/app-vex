import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import swal from 'sweetalert';
import { SubirArchivoService } from './subir-archivo.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService extends ServiceBase {

  constructor(
    public http: HttpClient, 
    public _subirArchivoService: SubirArchivoService 
  ) {
    super();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery('empresas', params);
  }

  show(id: string, params?: any): Observable<any> {
    return this.getQuery(`empresas/${id}`, params);
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('empresas', objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`empresas/${id}`, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`empresas/${id}`, objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  updateImg(archivo: File, params?: any): Promise<any> {
    return this._subirArchivoService.subirArchivo(archivo, '/empresas/subirimagen', params);
  }

  cuenta(params?: any): Observable<any> {
    return this.getQuery(`empresas/mi/cuenta`, params);
  }

  usuarios(params?: any): Observable<any> {
    return this.getQuery('empresa/usuarios', params);
  }

  consultaDniRuc(objeto: any): Observable<any> {
    return this.postQuery(`consulta/dniruc`, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  cargarData(id: number): Observable<any> {
    return this.postQuery(`empresas/cargardata/${id}`).pipe(
      map(data => {
        return data.data;
      })
    );
  }
}
