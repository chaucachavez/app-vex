import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import icMail from '@iconify/icons-ic/twotone-mail';
import { EntidadService } from 'src/app/services/entidad.service';
import { Utils } from 'src/app/services/utils';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: [fadeInUp400ms]
})
export class ForgotPasswordComponent implements OnInit {

  @ViewChild('email', { static: true }) emailElement: ElementRef;

  form = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email])
  });

  icMail = icMail;
  submitted = false;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private _utils: Utils,
    private _entidadService: EntidadService,
  ) { }

  ngOnInit() {
    this.emailElement.nativeElement.focus();
  }

  send() {
    const param = this.form.value;

    if (param.recuerdame) {
      localStorage.setItem('numerodoc', param.numerodoc);
    } else {
      localStorage.removeItem('numerodoc');
    }

    this.submitted = true;
    console.log('forgot()', param);
    this._entidadService.forgot(param).subscribe((data) => {
      this.submitted = false;
      this.snackBar.open(data, 'Cerrar');
      this.router.navigate(['/login']);
    }, error => {
      this.submitted = false;
      const message = this._utils.convertError(error);
      this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
    });
  }
}
