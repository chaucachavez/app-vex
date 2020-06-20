import { Component, OnInit, Inject, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Utils } from '../../../../app/services/utils';
import { ProductoService } from '../../../../app/services/producto.service';
import icClose from '@iconify/icons-ic/twotone-close';
import icSearch from '@iconify/icons-ic/twotone-search';
import icArrowDropDown from '@iconify/icons-ic/twotone-arrow-drop-down';
import icLocalOffer from '@iconify/icons-ic/twotone-local-offer';
import { DataInicial } from 'src/app/services/datainicial';
import { UnidadService } from 'src/app/services/unidad';
import { CategoriaService } from 'src/app/services/categoria.service';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { CatalogoService } from 'src/app/services/catalogo.service';
import { EntidadService } from 'src/app/services/entidad.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'vex-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ItemFormComponent implements OnInit {

  @ViewChild('nombre', { static: false }) nombreElement: ElementRef;

  // Formulario
  productoForm: FormGroup;
  dialogTitle: string;
  submitted: boolean;
  loading: boolean;
  action: string;
  settings: any;

  // Data inicial y listados
  monedas: any[] = this._datainicial.monedas;
  impuestos: any[] = this._datainicial.impuestos;
  unidadMedidas: any[] = [];
  categorias: any[] = [];

  // Buscador catalogo sunat
  catalogo = new FormControl();
  searchResult = { data: null, to: null, total: null };
  isLoadingSearch = false;

  // Cargador archivo
  imagenSubir: File;
  imagenTemp: any;

  // Iconos
  icClose = icClose;
  icSearch = icSearch;
  icLocalOffer = icLocalOffer;
  icArrowDropDown = icArrowDropDown;

  // Tabs
  activeTabIndex = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) private _data: any,
    public matDialogRef: MatDialogRef<ItemFormComponent>,
    private _productoService: ProductoService,
    private _unidadService: UnidadService,
    private _categoriaService: CategoriaService,
    private _catalogoService: CatalogoService,
    private snackBar: MatSnackBar,
    private _datainicial: DataInicial,
    private _utils: Utils,
    private _entidadService: EntidadService
  ) {

    this.action = _data.action;
    this.dialogTitle = _data.dialogTitle;

    if (this.action === 'edit') {
      this.show();
    } else {
      this.loading = false;
    }

    this.settings = this._entidadService.settings;
    console.log('this.settings', this.settings);
    this.listaUnidades();
    this.listaCategorias();
  }

  ngOnInit(): void {

    this.productoForm = this.createForm();

    if (this.settings.preciounitario) {
      this.productoForm.get('valorventa').setValidators(Validators.required);
      // this.productoForm.get('costoventa').clearValidators();
    } else {
      this.productoForm.get('costoventa').setValidators(Validators.required);
    }

    if (this.action === 'new') {
      setTimeout(() => {
        this.nombreElement.nativeElement.focus();
      }, 0);
    }

    this.catalogo.valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoadingSearch = true),
        switchMap(data => {
          console.log('typeof data', typeof data);

          if (typeof data === 'string') {
            this.productoForm.get('codigosunat').setValue(null);
          }

          if (typeof data === 'string' && data) {
            console.log('get API CATALOGO');
            const param = {
              page: 1,
              pageSize: 10,
              orderName: 'nombre',
              orderSort: 'asc'
            };

            if (parseFloat(data) > 0) {
              param['likeCodigo'] = data;
            } else {
              param['likeNombre'] = data;
            }

            return this._catalogoService.index(param)
              .pipe(
                finalize(() => this.isLoadingSearch = false),
              );
          } else {
            this.isLoadingSearch = false;
            return [];
          }
        })
      )
      .subscribe((data: any) => {
        this.searchResult = data;
      });
  }

  public handleTabChange(e: MatTabChangeEvent) {
    this.activeTabIndex = e.index;
  }

  listaUnidades(): void {
    this._unidadService.unidades()
      .subscribe((data: any) => {
        this.unidadMedidas = data.data;
      });
  }

  listaCategorias(): void {
    this._categoriaService.index()
      .subscribe((data: any) => {
        this.categorias = data.data;
      });
  }

  show(): void {
    this.loading = true;
    const param = {
      conRecurso: 'catalogo'
    };

    this._productoService.show(this._data.idproducto, param)
      .subscribe((data: any) => {
        this.loading = false;
        this.inicializarProducto(data.data);

        if (data.data.catalogo) {
          this.catalogo.setValue({
            codigo: data.data.catalogo.codigo,
            nombre: data.data.catalogo.nombre
          });
        }
      });
  }

  inicializarProducto(data): void {

    const producto = {
      idproducto: data.idproducto,
      nombre: data.nombre,
      moneda: data.moneda,
      costoventa: data.costoventa,
      valorventa: data.valorventa,
      idimpuesto: data.idimpuesto,
      destacado: data.destacado === '1' ? true : false,
      unidadmedida: data.unidadmedida,
      codigo: data.codigo,
      codigosunat: data.codigosunat,
      idcategoria: data.idcategoria,
      imgportada: data.imgportada
    };

    this.productoForm.setValue(producto);
  }

  createForm(): FormGroup {
    return new FormGroup({
      idproducto: new FormControl(null),
      nombre: new FormControl(null, [Validators.required]),
      codigo: new FormControl(null, [Validators.required]),
      unidadmedida: new FormControl(null, [Validators.required]),
      moneda: new FormControl('PEN'),
      costoventa: new FormControl(null),
      valorventa: new FormControl(null),
      idimpuesto: new FormControl(null, [Validators.required]),
      destacado: new FormControl(false),
      codigosunat: new FormControl(null),
      idcategoria: new FormControl(null),
      imgportada: new FormControl(null)
    });
  }

  seleccionImage(archivo: File): void {
    if (!archivo) {
      this.imagenSubir = null;
      return;
    }

    if (archivo.type.indexOf('image') === -1) {
      // swal('Sólo imágenes', 'El archivo seleccionado no es una imagen', 'error');
      this.imagenSubir = null;
      return;
    }

    this.imagenSubir = archivo;
    const reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onloadend = () => this.imagenTemp = reader.result;
    this.cambiarImagen();
  }

  cambiarImagen(): void {
    this._productoService.updateImg(this.productoForm.controls['idproducto'].value, this.imagenSubir)
      .then(data => {
        // swal('Imagen actualizada', data.data.nombre, 'success');
        // this.matDialogRef.close(true);
      })
      .catch(data => {
        console.log(data);
      });
  }

  displaySearchCatalogo(item?): string | null {
    return item ? item.nombre : null;
  }

  autocompletadoCatalogoSelected(data: any): void {
    if (data) {
      this.productoForm.get('codigosunat').setValue(data.codigo);
    }
  }

  save(): void {
    let param;
    param = this.productoForm.getRawValue();
    param.destacado = param.destacado ? '1' : '0';

    if (this.action === 'new') {
      this.submitted = true;
      this._productoService.create(param).subscribe((data) => {
        this.submitted = false;
        this.snackBar.open(`Ítem registrado.`, 'Cerrar');
        this.matDialogRef.close(data.data);
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }

    this.submitted = true;
    if (this.action === 'edit') {
      this._productoService.update(param.idproducto, param).subscribe((data) => {
        this.submitted = false;
        this.snackBar.open(`Ítem actualizado.`, 'Cerrar');
        this.matDialogRef.close(data.data);
      }, error => {
        const message = this._utils.convertError(error);
        this.submitted = false;
        this.snackBar.open(message, 'Cerrar', { panelClass: ['error-dialog'] });
      });
    }
  }

}
