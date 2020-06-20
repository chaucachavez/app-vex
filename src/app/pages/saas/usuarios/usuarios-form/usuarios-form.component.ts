import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { SedeService } from 'src/app/services/sede.service';
import { Utils } from 'src/app/services/utils';
import icClose from '@iconify/icons-ic/twotone-close';
import icPerson from '@iconify/icons-ic/twotone-person';
import icEmail from '@iconify/icons-ic/twotone-email';
import icPhone from '@iconify/icons-ic/twotone-phone';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';
import { ModuloService } from 'src/app/services/modulo.service';
import { EntidadService } from 'src/app/services/entidad.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vex-usuarios-form',
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsuariosFormComponent implements OnInit {

  @ViewChild('nombre', { static: true }) nombre: ElementRef;

  action: string;
  usuario: any;
  usuarioForm: FormGroup;
  dialogTitle: string;
  sedes: any[] = [];
  loading: boolean;

  icClose = icClose;
  icPerson = icPerson;
  icEmail = icEmail;
  icPhone = icPhone;
  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;

  submitted: boolean;

  inputType = 'password';
  visible = false;
  inputTypeConfirm = 'password';
  visibleConfirm = false;

  acciones = [{ permiso: 'L', nombre: 'Solo ver' }, { permiso: 'E', nombre: 'Ver, Crear y Modificar' }];

  tmpModulos = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    private cdpass: ChangeDetectorRef,
    private cdpassConfirm: ChangeDetectorRef,
    public matDialogRef: MatDialogRef<UsuariosFormComponent>,
    public _entidadService: EntidadService,
    private snackBar: MatSnackBar,
    private _userService: UserService,
    private _sedeService: SedeService,
    private _moduloService: ModuloService,
    private _utils: Utils
  ) {
    // Set the defaults
    this.action = _data.action;
    this.dialogTitle = _data.dialogTitle;

    if (this.action === 'edit') {
      this.show();
    } else {
      this.loading = false;
    }
  }

  ngOnInit(): void {
    // this.nombre.nativeElement.focus();
    this.usuarioForm = this.createForm();
    this.indexSedes();

    if (this.action === 'new') {
      this.indexModulos();
    }
  }

  show(): void {
    this.loading = true;
    const param = {
      conRecurso: 'sedes,modulos'
    };
    console.log(this._data);
    this._userService.show(this._data.id, param)
      .subscribe((data: any) => {
        // console.log('Usuario');
        this.loading = false;
        this.tmpModulos = data.data.modulos;
        this.inicializarEntidad(data.data);

        this.indexModulos();
      });
  }

  inicializarEntidad(data): void {
    const usuario = {
      id: data.id,
      name: data.name,
      email: data.email,
      celular: data.celular,
      acceso: data.acceso === '1' ? true : false,
      password: null,
      // passwordconfirm: null,
      sedes: [],
      modulos: []
    };

    data.sedes.forEach(item => {
      usuario.sedes.push(item.idsede);
    });

    this.usuarioForm.setValue(usuario);
  }

  createForm(): FormGroup {

    const patternEmail = '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$';

    return new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.pattern(patternEmail)]),
      celular: new FormControl(''),
      acceso: new FormControl(this.action === 'new' ? true : false, Validators.required),
      password: new FormControl(''),
      // passwordconfirm: new FormControl(''),
      sedes: new FormControl([]),
      modulos: new FormArray([])
    });
  }

  get xxx(): FormArray {
    return this.usuarioForm.get('modulos') as FormArray;
  }

  addItem(item?): void | boolean {
    const tmp = new FormGroup({
      idmodulo: new FormControl(item.idmodulo),
      nombre: new FormControl(item.nombre),
      activo: new FormControl(item.activo),
      permiso: new FormControl(item.permiso),
      anotacion: new FormControl(item.anotacion),
    });

    this.xxx.push(tmp);
  }

  indexSedes(): void {
    const param = {
      orderName: 'nombre',
      orderSort: 'asc'
    };

    this._sedeService.index(param)
      .subscribe((data: any) => {
        this.sedes = data.data;
      });
  }

  indexModulos(): void {
    this._moduloService.modulosEmpresa()
      .subscribe((data: any) => {
        // console.log('Modulos', data);
        // this.sedes = data.data;
        data.forEach(row => {
          if (row.idmodulo !== 95) {

            let anotacion: string;

            switch (row.idmodulo) {
              case 86: anotacion = 'Facturas, Boletas de venta, Notas de crédito y débito'; break;
              case 97: anotacion = 'Generación masiva de comprobantes'; break;
              case 89: anotacion = 'Categorias de producto y servicios'; break;
              case 88: anotacion = 'Productos y servicios'; break;
              case 80: anotacion = 'Facturas, Boletas de proveedores'; break;
              default: anotacion = ''; break;
            }

            const param = {
              idmodulo: row.idmodulo,
              nombre: row.nombre,
              activo: false,
              permiso: 'E',
              anotacion
            };

            this.tmpModulos.forEach(modulo => {
              if (modulo.idmodulo === row.idmodulo) {
                param.activo = true;
                param.permiso = modulo.modulo_users.permiso;
              }
            });

            this.addItem(param);
          }
        });
      });
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cdpass.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cdpass.markForCheck();
    }
  }

  toggleConfirmVisibility() {
    if (this.visibleConfirm) {
      this.inputTypeConfirm = 'password';
      this.visibleConfirm = false;
      this.cdpassConfirm.markForCheck();
    } else {
      this.inputTypeConfirm = 'text';
      this.visibleConfirm = true;
      this.cdpassConfirm.markForCheck();
    }
  }

  save(): void {
    let param;
    param = this.usuarioForm.getRawValue();
    param.acceso = param.acceso ? '1' : '0';

    // Filtrar modulos seleccionados
    const modulosActivos = [];

    param.modulos.forEach(row => {
      if (row.activo) {
        modulosActivos.push({ idmodulo: row.idmodulo, permiso: row.permiso });
      }
    });

    param.modulos = modulosActivos;

    if (this.action === 'new' && !param.password) {
      this.snackBar.open('Ingrese contraseña', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

    if (param.sedes.length === 0) {
      this.snackBar.open('Asigne al menos un local', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

    if (param.modulos.length === 0) {
      this.snackBar.open('Asigne al menos un permiso', 'Cerrar', { panelClass: ['error-dialog'] });
      return;
    }

    param.modulos.push({ idmodulo: 95, permiso: 'E' });

    this.submitted = true;

    if (this.action === 'new') {
      this._userService.create(param).subscribe((data) => {
        this.submitted = false;
        this.snackBar.open(`Usuario registrado.`, 'Cerrar');
        this.matDialogRef.close(data);
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }

    if (this.action === 'edit') {
      this._userService.update(param.id, param).subscribe((data) => {
        this.snackBar.open(`Usuario actualizado.`, 'Cerrar');
        this.matDialogRef.close(data);
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }
  }

}
