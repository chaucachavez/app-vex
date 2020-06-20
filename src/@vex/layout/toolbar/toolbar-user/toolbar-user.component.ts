import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PopoverService } from '../../../components/popover/popover.service';
import { ToolbarUserDropdownComponent } from './toolbar-user-dropdown/toolbar-user-dropdown.component';
import icPerson from '@iconify/icons-ic/twotone-person';
import icExitToApp from '@iconify/icons-ic/twotone-exit-to-app';
import icSettings from '@iconify/icons-ic/twotone-settings';
import { EntidadService } from 'src/app/services/entidad.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LayoutService } from 'src/@vex/services/layout.service';

@Component({
  selector: 'vex-toolbar-user',
  templateUrl: './toolbar-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarUserComponent implements OnInit {

  dropdownOpen: boolean;
  icPerson = icPerson;
  icExitToApp = icExitToApp;
  icSettings = icSettings;
  nombre: string;

  constructor(private popover: PopoverService,
    private cd: ChangeDetectorRef,
    public _entidadService: EntidadService,
    private snackBar: MatSnackBar,
    private router: Router,
    private layoutService: LayoutService
  ) {

    if (this._entidadService.usuario) {
      const nombreCompleto = this._entidadService.usuario.name.split(' ');
      this.nombre = nombreCompleto[0];
    }
  }

  ngOnInit() {
  }

  showPopover(originRef: HTMLElement) {
    this.dropdownOpen = true;
    this.cd.markForCheck();

    const popoverRef = this.popover.open({
      content: ToolbarUserDropdownComponent,
      origin: originRef,
      offsetY: 12,
      position: [
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom'
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ]
    });

    popoverRef.afterClosed$.subscribe(() => {
      this.dropdownOpen = false;
      this.cd.markForCheck();
    });
  }

  openConfigpanel() {
    this.layoutService.openConfigpanel();
  }

  closeConfigpanel() {
    this.layoutService.closeConfigpanel();
  }

  salir(): void {
    this.layoutService.closeConfigpanel();
    this.layoutService.closeConfigpanel();
    this._entidadService.logout()
      .subscribe(() => this.router.navigate(['/login']), error => {
        this.snackBar.open(error.error.error, 'Cerrar');
      });
  }
}
