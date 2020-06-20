import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceBase } from './serviceBase';
import { map } from 'rxjs/operators';
import { SubirArchivoService } from './subir-archivo.service';
import { NavigationService } from '../../@vex/services/navigation.service';
import { Utils } from './utils';
import { Observable } from 'rxjs';

import icSettings from '@iconify/icons-ic/twotone-settings';
import icDomain from '@iconify/icons-ic/twotone-domain';
import icHome from '@iconify/icons-ic/twotone-home';
import icPrint from '@iconify/icons-ic/twotone-print';
import icInsertDriveFile from '@iconify/icons-ic/twotone-insert-drive-file';
import icAccountCircle from '@iconify/icons-ic/twotone-account-circle';
import icShoppingCart from '@iconify/icons-ic/twotone-shopping-cart';
import icBallot from '@iconify/icons-ic/twotone-ballot';
import icLocalOffer from '@iconify/icons-ic/twotone-local-offer';
import icBlock from '@iconify/icons-ic/twotone-block';
import icStar from '@iconify/icons-ic/twotone-star';

@Injectable({
  providedIn: 'root'
})
export class EntidadService extends ServiceBase {

  token: string;
  usuario: any;
  settings: any;
  modulos: any[] = [];
  sedes: any[] = [];
  sedeDefault: any;

  constructor(
    public http: HttpClient,
    public _subirArchivoService: SubirArchivoService,
    private navigationService: NavigationService,
    private _utils: Utils
  ) {
    super();
    this.cargarStorage();
  }

  // Metodos
  index(params?: any): Observable<any> {
    return this.getQuery(`entidades`, params);
  }

  show(id: number, params?: any): Observable<any> {
    return this.getQuery(`entidades/${id}`, params).pipe(
      map(item => {
        if (item.data.fechanacimiento) {
          item.data.fechanacimiento = this._utils.convertDate(item.data.fechanacimiento);
        }

        return item;
      })
    );
  }

  create(objeto: any): Observable<any> {
    return this.postQuery('entidades', objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  update(id: number, objeto: any): Observable<any> {
    return this.putQuery(`entidades/${id}`, objeto).pipe(
      map(data => {
        return data;
      })
    );
  }

  delete(id: number, objeto?: any): Observable<any> {
    return this.deleteQuery(`entidades/${id}`, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  actualizarUsuario(id: number, objeto: any): Observable<any> {
    return this.putQuery(`entidades/${id}`, objeto).pipe(
      map(data => {
        const usuarioDB = data.data;
        this.guardarStorage(usuarioDB.identidad, this.token, usuarioDB);
        return true;
      })
    );
  }

  estaLogueado(): boolean {
    this.cargarStorage();
    return (this.token.length > 5) ? true : false;
  }

  authenticate(objeto: any): Observable<any> {
    return this.postQuery(`authenticate`, objeto).pipe(
      map(data => {

        const user = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          idempresa: data.data.user.idempresa,
          imgperfil: data.data.user.imgperfil
        };

        localStorage.setItem('tokenPF', 'Bearer ' + data.data.token);
        localStorage.setItem('usuarioPF', JSON.stringify(user));
        localStorage.setItem('settingsPF', JSON.stringify(data.data.settings));
        localStorage.setItem('modulosPF', JSON.stringify(this.setmodulos(data.data.user.modulos)));
        localStorage.setItem('sedesPF', JSON.stringify(data.data.user.sedes));

        if (data.data.user.sedes.length === 1) {
          localStorage.setItem('sedeDefaultPF', String(data.data.user.sedes[0].idsede));
        }

        this.cargarStorage();

        this.navigationService.items = this.modulos;

        return data.data;
      })
    );
  }

  cargarStorage(): void {
    if (localStorage.getItem('tokenPF')) {
      this.token = localStorage.getItem('tokenPF');
      this.usuario = JSON.parse(localStorage.getItem('usuarioPF'));
      this.settings = JSON.parse(localStorage.getItem('settingsPF'));
      this.modulos = JSON.parse(localStorage.getItem('modulosPF'));
      this.sedes = JSON.parse(localStorage.getItem('sedesPF'));
      this.sedeDefault = parseInt(localStorage.getItem('sedeDefaultPF'), 10);
    } else {
      this.token = '';
      this.usuario = null;
      this.settings = null;
      this.modulos = [];
      this.sedes = [];
      this.sedeDefault = null;
    }
  }

  refreshToken(token: string): void {
    localStorage.setItem('tokenPF', 'Bearer ' + token);
    this.token = localStorage.getItem('tokenPF');
  }

  setSede(id: number): void {
    localStorage.setItem('sedeDefaultPF', String(id));
    this.cargarStorage();
  }

  setmodulos(data: any[]): any[] {

    const modulos = [];

    // Nivel 1: Modulo
    if (data) {
      data.forEach(item => {

        const options: any = {
          id: item.idmodulo,
          type: item.url ? 'link' : 'subheading',
          label: item.nombre
        };

        if (item.url) {
          let icono: any;
          switch (item.maticon) {
            case 'icSettings': icono = icSettings; break;
            case 'icDomain': icono = icDomain; break;
            case 'icHome': icono = icHome; break;
            case 'icPrint': icono = icPrint; break;
            case 'icInsertDriveFile': icono = icInsertDriveFile; break;
            case 'icAccountCircle': icono = icAccountCircle; break;
            case 'icShoppingCart': icono = icShoppingCart; break;
            case 'icBallot': icono = icBallot; break;
            case 'icLocalOffer': icono = icLocalOffer; break;
            case 'icBlock': icono = icBlock; break;
            case 'icStar': icono = icStar; break;
            default:
              icono = icStar;
              break;
          }

          options['route'] = item.url;
          options['icon'] = icono;
        } else {
          options['children'] = [];
        }

        if (item.nivel === 1) {
          modulos.push(options);
        }
      });
    }

    // Nivel 2: Menu
    modulos.forEach(modulo => {
      data.forEach(item => {
        if (item.parent === modulo.id) {
          const options = {
            id: item.idmodulo,
            label: item.nombre,
            type: item.url ? 'link' : 'dropdown',
            icon: icShoppingCart
          };

          if (item.url) {
            options['route'] = item.url;
          } else {
            options['children'] = [];
          }
          modulo.children.push(options);
        }
      });
    });

    // Nivel 3: Submenu
    modulos.forEach(modulo => {

      if (modulo.children) {
        modulo.children.forEach(menu => {
          data.forEach(item => {
            if (item.parent === menu.id) {
              let url;
              if (item.url) {
                url = item.url;
              } else {
                url = '#';
              }

              const options = {
                id: item.idmodulo,
                label: item.nombre,
                type: 'link',
                icon: icPrint,
                route: url
              };

              if (menu.children) {
                menu.children.push(options);
              }
            }
          });
        });
      }
    });

    return modulos;
  }

  guardarStorage(id: string, token: string, usuario: any, modulos?: any[]): void {
    // localStorage.setItem('id', id);
    localStorage.setItem('tokenPF', token);
    localStorage.setItem('usuarioPF', JSON.stringify(usuario));

    if (modulos) {
      localStorage.setItem('modulosPF', JSON.stringify(modulos));
    }

    this.token = token;
    this.usuario = usuario;

    if (modulos) {
      this.modulos = modulos;
    }
  }

  logout(): Observable<any> {
    return this.postQuery('logouta').pipe(
      map(data => {
        this.token = '';
        this.usuario = null;
        this.settings = null;
        this.modulos = [];
        this.sedes = [];
        this.sedeDefault = null;
        // localStorage.removeItem('id');
        localStorage.removeItem('tokenPF');
        localStorage.removeItem('usuarioPF');
        localStorage.removeItem('settingsPF');
        localStorage.removeItem('modulosPF');
        localStorage.removeItem('sedesPF');
        localStorage.removeItem('sedeDefaultPF');
      })
    );
  }

  clearStorage(): void {
    console.log('CLEAR storage y propiedades');

    this.token = '';
    this.usuario = null;
    this.settings = null;
    this.modulos = [];
    this.sedes = [];
    this.sedeDefault = null;
    // localStorage.removeItem('id');
    localStorage.removeItem('tokenPF');
    localStorage.removeItem('usuarioPF');
    localStorage.removeItem('settingsPF');
    localStorage.removeItem('modulosPF');
    localStorage.removeItem('sedesPF');
    localStorage.removeItem('sedeDefaultPF');
  }

  cambiarImagen(archivo: File, id: string): void {
    this._subirArchivoService.subirArchivo(archivo, '/entidades/subirimagen/' + id)
      .then(data => {
        this.usuario.imgperfil = data.data.imgperfil;
        this.guardarStorage(id, this.token, this.usuario);
      })
      .catch(data => {
        console.log(data);
      });
  }

  updateImgPerfil(imgperfil): void {
    this.usuario.imgperfil = imgperfil;
    console.log(this.usuario.id, this.token, this.usuario);
    this.guardarStorage(this.usuario.id, this.token, this.usuario);
  }

  updateImg(archivo: File): Promise<any> {
    return this._subirArchivoService.subirArchivo(archivo, '/users/subirimagen/perfil');
  }

  empresaToken(objeto: any): Observable<any> {
    return this.postQuery('empresatoken', objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  verify(token: string): Observable<any> {
    return this.getQuery('users/verify/' + token).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  forgot(objeto: any): Observable<any> {
    return this.postQuery('users/forgot', objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  reset(token: string, objeto: any): Observable<any> {
    return this.postQuery('users/reset/' + token, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  me(token: string): Observable<any> {
    return this.getQuery(`users/me/${token}`).pipe(
      map(data => {
        return data.data;
      })
    );
  }

  meUpdate(token: string, objeto: any): Observable<any> {
    return this.postQuery(`users/me/${token}/update`, objeto).pipe(
      map(data => {
        return data.data;
      })
    );
  }
}
