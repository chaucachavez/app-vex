import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { EntidadService } from 'src/app/services/entidad.service';
import { Utils } from 'src/app/services/utils';
import { EmpresaService } from 'src/app/services/empresa.service';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  animations: [
    fadeInUp400ms
  ]
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;

  inputType = 'password';
  visible = false;

  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;
  submitted = false;

  constructor(
    private cd: ChangeDetectorRef,
    private _matDialog: MatDialog,
    private _entidadService: EntidadService,
    private _empresaService: EmpresaService,
    private _utils: Utils,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.registerForm = new FormGroup({
      email: new FormControl('cesar.cardenaschauca@gmail.com', [Validators.required, Validators.email]),
      password: new FormControl('vikingo', [Validators.required]),
      ruc: new FormControl('20600196368', [Validators.required]),
      celular: new FormControl('970879206', [Validators.required])
    });
  }

  send() {
    this.router.navigate(['/']);
  }

  save(): void {
    const param = this.registerForm.value;

    this.submitted = true;
    this._empresaService.create(param).subscribe((data) => {
      this.submitted = false;
      this.snackBar.open(`Bienvenido "${data.data.nombre}"`, 'Cerrar');
      this.authenticar(param.email, param.password);
    }, error => {
      const message = this._utils.convertError(error);
      this.submitted = false;
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

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }
}
