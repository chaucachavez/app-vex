import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, Validators, ValidatorFn, FormControl } from '@angular/forms';
import { Utils } from 'src/app/services/utils';
import { URL_SERVICIOS } from 'src/app/config/config';
import { EntidadService } from 'src/app/services/entidad.service';
import icArrowBack from '@iconify/icons-ic/twotone-arrow-back';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-cuenta',
  templateUrl: './cuenta.component.html',
  styleUrls: ['./cuenta.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CuentaComponent implements OnInit {

  usuario: any;
  usuarioForm: FormGroup;

  /* UploadImg */
  imagenSubir: File;
  imagenTemp: any;
  /* UploadImg */

  submitted = false;
  icArrowBack = icArrowBack;

  URL_SERVICIOS = URL_SERVICIOS;
  urlPerfil;

  constructor(
    private _entidadService: EntidadService,
    private snackBar: MatSnackBar,
    private _utils: Utils
  ) {
    this.show();
  }

  ngOnInit(): void {
    this.usuarioForm = this.createForm();
  }

  createForm(): FormGroup {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl(''),
      passwordConfirm: new FormControl('', [confirmPasswordValidator]),
      name: new FormControl(''),
      celular: new FormControl(''),
      imgperfil: new FormControl('')
    });
  }

  show(): void {
    const token = localStorage.getItem('tokenPF').split(' ')[1];
    this._entidadService.me(token)
      .subscribe((data: any) => {
        console.log('data:', data);
        this.inicializarUsuario(data);
        this.urlPerfil = this.urlPerfil = URL_SERVICIOS + '/persona/' + data.id + '/' + this.usuarioForm.get('imgperfil')['value'];
      });
  }

  inicializarUsuario(data): void {
    const empresa = {
      email: data.email,
      password: null,
      passwordConfirm: null,
      name: data.name,
      celular: data.celular,
      imgperfil: data.imgperfil
    };

    this.usuarioForm.setValue(empresa);
  }

  seleccionImage(archivo: File): void | boolean {
    if (!archivo) {
      this.imagenSubir = null;
      return false;
    }

    if (archivo.type.indexOf('image') === -1) {
      this.snackBar.open('El archivo seleccionado no es una imagen', 'Cerrar', { panelClass: ['error-dialog'] });
      this.imagenSubir = null;
      return false;
    }

    this.imagenSubir = archivo;

    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onloadend = () => this.imagenTemp = reader.result;

    this._entidadService.updateImg(this.imagenSubir)
      .then(data => {
        this._entidadService.updateImgPerfil(data.data.imgperfil);
        this.snackBar.open(`Se actualizó imagen`, 'Cerrar');
      })
      .catch(data => {
      });
  }

  save(): void | boolean {
    const password = this.usuarioForm.controls['password'].value || '';
    const passwordConfirm = this.usuarioForm.controls['passwordConfirm'].value || '';

    if (password !== passwordConfirm) {
      this.snackBar.open('Confirmar contraseña erronea', 'Cerrar', { panelClass: ['error-dialog'] });
      return false;
    }

    const usuario = Object.assign({}, this.usuarioForm.value);

    this.submitted = true;
    this._entidadService.meUpdate(localStorage.getItem('tokenPF'), usuario)
      .subscribe((data) => {
        this.submitted = false;
        this.snackBar.open(`${data.name} actualizado.`, 'Cerrar');
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
  }

}


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

  return { 'passwordsNotMatching': true };
};
