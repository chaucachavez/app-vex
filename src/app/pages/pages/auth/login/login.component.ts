import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EntidadService } from '../../../../../app/services/entidad.service';
import { Utils } from '../../../../../app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';
import { fadeInUp400ms } from '../../../../../@vex/animations/fade-in-up.animation';
import { SedeSelectionComponent } from '../../../../components/sede-selection/sede-selection.component';

@Component({
  selector: 'vex-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeInUp400ms
  ]
})
export class LoginComponent implements OnInit {

  @ViewChild('email', { static: true }) emailElement: ElementRef;

  // Formulario
  loginForm: FormGroup;
  inputType = 'password';
  numerodoc: string;
  submitted = false;
  visible = false;
  hide = false;

  // Iconos
  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;

  constructor(
    private routerActivated: ActivatedRoute,
    private _matDialog: MatDialog,
    private _entidadService: EntidadService,
    private _utils: Utils,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // console.log('routerActivated');
    this.routerActivated.params.subscribe(params => {
      if (params['token']) {
        this.verify(params['token']);
      }
    });

    if (localStorage.getItem('tokenPF')) {
      const token = localStorage.getItem('tokenPF').split(' ');
      this._entidadService.me(token[1])
        .subscribe((data: any) => {
          console.log('Redirigiendo a /inicio', data);
          this.router.navigate(['/inicio']);
        });
    }
  }

  ngOnInit() {
    this.numerodoc = localStorage.getItem('numerodoc') || '44120026';
    this.loginForm = new FormGroup({
      email: new FormControl('chaucachavez@gmail.com', [Validators.required, Validators.email]),
      password: new FormControl('a', [Validators.required]),
      recuerdame: new FormControl(false)
    });

    this.emailElement.nativeElement.focus();
  }

  verify(token: string): void {
    // this._entidadService.refreshToken(token);
    this._entidadService.verify(token).subscribe((data) => {
      this.loginForm.get('email').setValue(data.email);
      setTimeout(() => {
        this.emailElement.nativeElement.focus();
      }, 0);
      // return data.data;
    }, error => {
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar');
    });
  }

  authenticar(): void {
    const param = this.loginForm.value;

    if (param.recuerdame) {
      localStorage.setItem('numerodoc', param.numerodoc);
    } else {
      localStorage.removeItem('numerodoc');
    }

    this.submitted = true;
    this._entidadService.authenticate(param).subscribe((data) => {
      this.submitted = false;
      this.snackBar.open('Sesión iniciada', 'Cerrar');
      if (data.user.sedes.length === 1) {
        this.router.navigate(['/inicio']);
      } else {
        this.selectionSede(data.user.sedes);
      }
    }, error => {
      this.submitted = false;
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  selectionSede(sedes: any[]): void {

    const dialogRef = this._matDialog.open(SedeSelectionComponent, {
      panelClass: 'sede-selection-dialog',
      data: {
        sedes,
        salir: true
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }

        if (typeof response === 'string' && response === 'salir') {
          this._entidadService.logout()
            .subscribe(() => {
              this.snackBar.open('Sesión cerrada', 'Cerrar');
            }, error => {
              const message = this._utils.convertError(error);
              this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
            });
        } else {
          this.router.navigate(['/inicio']);
        }
      });
  }

  empresaToken(idempresa: number, idsede: number): void {
    const param = {
      idempresa
    };

    this._entidadService.empresaToken(param).subscribe((data) => {
      console.log(data.token);
      this._entidadService.refreshToken(data.token);
      this._entidadService.setSede(idsede);
      this.router.navigate(['/inicio']);
    }, error => {
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
    } else {
      this.inputType = 'text';
      this.visible = true;
    }
  }
}
