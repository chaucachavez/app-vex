import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { EntidadService } from '../services/entidad.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardGuard implements CanActivate {

  constructor(
    private _router: Router,
    private _entidadService: EntidadService
  ) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if (this._entidadService.estaLogueado()) {
        console.log('Paso por el Guard');
        return true;
      } else {
        console.log('Bloqueado por el Guard');
        this._router.navigate(['/login']);
        // return false;
      }
  }
}
