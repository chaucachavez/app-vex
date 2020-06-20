import {Injectable} from '@angular/core';
import {HttpHandler, HttpRequest, HttpInterceptor} from '@angular/common/http';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/internal/operators';
import { Utils } from './utils';
import { Router } from '@angular/router';
import { EntidadService } from './entidad.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    // private snackBar: MatSnackBar,
    private _utils: Utils,
    private _entidadService: EntidadService
    ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // https://medium.com/@nicowernli/angular-captura-todos-los-errores-de-httpclient-mediante-un-httpinterceptor-2cead03bb654
    // https://www.thecodehubs.com/using-httpinterceptor-in-angular-9/
    return next.handle(req).pipe(

      catchError(error => {
        let errorMessage = '';
        if (error instanceof ErrorEvent) {
          // client-side error
          errorMessage = `Client-side error: ${error.error.message}`;
        } else {
          // backend error
          errorMessage = `Server-side error: ${error.status} ${error.message}`;
        }
        console.log('ESTAMOS EN EL INTERCEPTOR', errorMessage);

        const message = this._utils.convertError(error);
        if (error.hasOwnProperty('error') && error.error.code === 400) {
          /* 400
             JWT: Token a expirado
             JWT: Token es envalido
             JWT: Token ausente
             JWT: Token no existe
          */
          this._entidadService.clearStorage();
          // this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
          this.router.navigate(['/login']);
        }

        if (error.hasOwnProperty('error') && error.error.code === 401) {
          /* 401
             No autenticado
             No autorizado
             Contraseña incorrecta
          */
          // this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
          this.router.navigate(['/login']);
        }

        return throwError(error);
      })
    );
  }
}