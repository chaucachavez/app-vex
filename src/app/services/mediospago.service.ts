import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MediospagoService extends ServiceBase {

  constructor(public http: HttpClient) {
    super(); 
  }

  // Metodos
  index(params?: any): Observable<any> { 
    return this.getQuery('mediospago', params).pipe(
      map(data => { 
        return data;
      })
    );
  } 

}
