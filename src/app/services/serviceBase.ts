import { HttpHeaders, HttpParams } from '@angular/common/http';
import { URL_SERVICIOS, URL_SCONTECH_PRODUCCION } from '../config/config';
import { Observable } from 'rxjs';

export class ServiceBase {

    public url = URL_SERVICIOS;
    public token = '';
    public http;
    public urlScontech = URL_SCONTECH_PRODUCCION;

    constructor() {

    }

    getQuery(query: string, param?: any): Observable<any> {

        let token = '';
        if (localStorage.getItem('tokenPF')) {
            token = localStorage.getItem('tokenPF');
        }

        const headers = new HttpHeaders({
            Authorization: token
        });

        let params = new HttpParams();

        if (param) {
            for (let i in param) {
                params = params.append(i, String(param[i]));
            }
        }

        return this.http.get(`${this.url}/${query}`, { headers, params });
    }

    postQuery(query: string, object?: any): Observable<any> {

        let headers = new HttpHeaders({
            // Authorization: token,
            'Content-Type': 'application/json'
        });

        let token = null;
        if (localStorage.getItem('tokenPF')) {
            token = localStorage.getItem('tokenPF');
            headers = headers.set('Authorization', token);
        }

        return this.http.post(`${this.url}/${query}`, object, { headers });
    }

    postDownload(query: string, object?: any): Observable<any> {
        // https://stackoverflow.com/questions/51789871/download-file-from-http-post-request-angular-6
        // https://shekhargulati.com/2017/07/16/implementing-file-save-functionality-with-angular-4/
        let token = '';
        if (localStorage.getItem('tokenPF')) {
            token = localStorage.getItem('tokenPF');
        }

        const headers = new HttpHeaders({
            Authorization: token,
            'Content-Type': 'application/json'
        });

        return this.http.post(`${this.url}/${query}`, object, { headers, responseType: 'blob' });
    }

    getDownloadProxy(query: string, object?: any): Observable<any> {
        /* 21.01.2020: Solucion desde Youtube: Esta URL coincide con el proxy configurado (proxy.conf.json)  */
        const headers = new HttpHeaders();
        // headers = headers.set('Content-Type', 'application/pdf'); // Ahora se descarga PDF, XML y CDR
        console.log('query', query);
        return this.http.get(`${query}`, { headers, responseType: 'blob' });
    }

    putQuery(query: string, object?: any): Observable<any> {

        let token = '';
        if (localStorage.getItem('tokenPF')) {
            token = localStorage.getItem('tokenPF');
        }

        const headers = new HttpHeaders({
            Authorization: token,
            'Content-Type': 'application/json'
        });

        return this.http.put(`${this.url}/${query}`, object, { headers });
    }

    deleteQuery(query: string, object?: any): Observable<any> {

        let token = '';
        if (localStorage.getItem('tokenPF')) {
            token = localStorage.getItem('tokenPF');
        }

        const headers = new HttpHeaders({
            Authorization: token,
            'Content-Type': 'application/json'
        });

        return this.http.delete(`${this.url}/${query}`, { headers });
    }

    // Proveedores terceros
    postScontech(query: string, object?: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });

        return this.http.post(`${this.urlScontech}/${query}`, object, { headers });
    }
}
