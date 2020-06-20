import { Component, Inject, LOCALE_ID, Renderer2 } from '@angular/core';
import { ConfigService } from '../@vex/services/config.service';
import { Settings } from 'luxon';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { NavigationService } from '../@vex/services/navigation.service';
import icLayers from '@iconify/icons-ic/twotone-layers';
import { LayoutService } from '../@vex/services/layout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SplashScreenService } from '../@vex/services/splash-screen.service';
import { Style, StyleService } from '../@vex/services/style.service';
import { ConfigName } from '../@vex/interfaces/config-name.model';
import { EntidadService } from './services/entidad.service';

@Component({
  selector: 'vex-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'vex';

  constructor(private configService: ConfigService,
    private styleService: StyleService,
    private renderer: Renderer2,
    private platform: Platform,
    @Inject(DOCUMENT) private document: Document,
    @Inject(LOCALE_ID) private localeId: string,
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private splashScreenService: SplashScreenService,
    private _entidadService: EntidadService,
    private router: Router) {
    Settings.defaultLocale = this.localeId;

    if (this.platform.BLINK) {
      this.renderer.addClass(this.document.body, 'is-blink');
    }

    /**
     * Customize the template to your needs with the ConfigService
     * Example:
     *  this.configService.updateConfig({
     *    sidenav: {
     *      title: 'Custom App',
     *      imageUrl: '//placehold.it/100x100',
     *      showCollapsePin: false
     *    },
     *    showConfigButton: false,
     *    footer: {
     *      visible: false
     *    }
     *  });
     */

    /**
     * Config Related Subscriptions
     * You can remove this if you don't need the functionality of being able to enable specific configs with queryParams
     * Example: example.com/?layout=apollo&style=default
     */
    this.route.queryParamMap.pipe(
      map(queryParamMap => queryParamMap.has('rtl') && coerceBooleanProperty(queryParamMap.get('rtl'))),
    ).subscribe(isRtl => {
      this.document.body.dir = isRtl ? 'rtl' : 'ltr';
      this.configService.updateConfig({
        rtl: isRtl
      });
    });

    this.route.queryParamMap.pipe(
      filter(queryParamMap => queryParamMap.has('layout'))
    ).subscribe(queryParamMap => this.configService.setConfig(queryParamMap.get('layout') as ConfigName));

    this.route.queryParamMap.pipe(
      filter(queryParamMap => queryParamMap.has('style'))
    ).subscribe(queryParamMap => this.styleService.setStyle(queryParamMap.get('style') as Style));


    // this.navigationService.items = [
    //   {
    //     type: 'link',
    //     label: 'Dashboard',
    //     route: '/',
    //     icon: icLayers
    //   }
    // ];

    /**
     * Add your own routes here
     */
    const ifactopciones: any[] = this._entidadService.modulos;
    this.navigationService.items = ifactopciones;

    if (localStorage.getItem('tokenPF')) {
      /* Permite verificar si el TOKEN presente es válido, de no serlo se activa el Interceptor que redirecciona a Login.
       * Util, cuando el TOKEN ha caducado o USUARIO cerró sesion en otra pestaña, lo ideal es que el token no caduque.
       *
       * Si TOKEN ya caducó o cerró sesión en otra pestana y ya había cargado app.component no hay forma de controlar a no ser
       * que hagamos la varificacion en cada componente hijo (ej. dashboard, configuracion); sin embargo a la siguiente petición
       * al servidor con el TOKEN se controla al 100% gracias al Interceptor.
       */
      const token = localStorage.getItem('tokenPF').split(' ');
      this._entidadService.me(token[1])
        .subscribe((data: any) => {
          if ((['/login'].indexOf(this.router.url) !== -1)) {
            console.log('APP TOKEN Redirigiendo a Dashboard', data);
            this.router.navigate(['/inicio']);
          }
        });
    } else {
      this.router.navigate(['/inicio']);
    }
  }
}
