import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import icVpnKey from '@iconify/icons-ic/twotone-vpn-key';
import { EntidadService } from 'src/app/services/entidad.service';
import { Utils } from 'src/app/services/utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-generate-password',
  templateUrl: './generate-password.component.html',
  styleUrls: ['./generate-password.component.scss'],
  animations: [fadeInUp400ms]
})
export class GeneratePasswordComponent implements OnInit {

  @ViewChild('password', { static: true }) passwordElement: ElementRef;

  resetPasswordForm: FormGroup;
  forgottoken = '';
  submitted = false;
  user = { email: null, name: null };
  icVpnKey = icVpnKey;

  private _unsubscribeAll: Subject<any>;

  constructor(
    private routerActivated: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private _utils: Utils,
    private _entidadService: EntidadService,
  ) {
    this._unsubscribeAll = new Subject();

    if (_entidadService.estaLogueado()) {
      this.router.navigate(['/inicio']);
    } else {
      this.routerActivated.params.subscribe(params => {
        if (params['forgottoken']) {
          this.forgottoken = params['forgottoken'];
          this.me();
        }
      });
    }
  }

  ngOnInit() {
    this.resetPasswordForm = new FormGroup({
      password: new FormControl('', Validators.required),
      passwordConfirm: new FormControl('', [Validators.required, confirmPasswordValidator])
    });

    this.resetPasswordForm.get('password').valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.resetPasswordForm.get('passwordConfirm').updateValueAndValidity();
      });

    this.passwordElement.nativeElement.focus();
  }

  me(): void {
    this._entidadService.me(this.forgottoken).subscribe((data) => {
      this.submitted = false;
      this.user = data;
    }, error => {
      this.submitted = false;
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  resetPassword(): void {
    const param = this.resetPasswordForm.value;
    this.submitted = true;
    this._entidadService.reset(this.forgottoken, param).subscribe((data) => {
      this.submitted = false;
      this.snackBar.open(data, 'Cerrar');
      this.authenticar(this.user.email, param.password);
    }, error => {
      this.submitted = false;
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }

  authenticar(email: string, password: string): void {
    const param = {
      email,
      password
    };

    this._entidadService.authenticate(param).subscribe((data) => {
      this.snackBar.open('Sesión iniciada', 'Cerrar');
      this.router.navigate(['/inicio']);
    }, error => {
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }
}

/**
 * Confirm password validator
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

  if (!control.parent || !control) {
    return null;
  }

  const password = control.parent.get('password');
  const passwordConfirm = control.parent.get('passwordConfirm');

  if (!password || !passwordConfirm) {
    return null;
  }

  if (passwordConfirm.value === '') {
    return null;
  }

  if (password.value === passwordConfirm.value) {
    return null;
  }

  return { passwordsNotMatching: true };
};
