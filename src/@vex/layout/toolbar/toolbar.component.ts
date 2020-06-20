import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import icBookmarks from '@iconify/icons-ic/twotone-bookmarks';
import emojioneUS from '@iconify/icons-emojione/flag-for-flag-united-states';
import emojioneDE from '@iconify/icons-emojione/flag-for-flag-germany';
import icMenu from '@iconify/icons-ic/twotone-menu';
import { ConfigService } from '../../services/config.service';
import { map } from 'rxjs/operators';
import icPersonAdd from '@iconify/icons-ic/twotone-person-add';
import icAssignmentTurnedIn from '@iconify/icons-ic/twotone-assignment-turned-in';
import icBallot from '@iconify/icons-ic/twotone-ballot';
import icDescription from '@iconify/icons-ic/twotone-description';
import icAssignment from '@iconify/icons-ic/twotone-assignment';
import icReceipt from '@iconify/icons-ic/twotone-receipt';
import icDoneAll from '@iconify/icons-ic/twotone-done-all';
import { NavigationService } from '../../services/navigation.service';
import icArrowDropDown from '@iconify/icons-ic/twotone-arrow-drop-down';
import { PopoverService } from '../../components/popover/popover.service';
import { MegaMenuComponent } from '../../components/mega-menu/mega-menu.component';
import icSearch from '@iconify/icons-ic/twotone-search';
import icAccountCircle from '@iconify/icons-ic/twotone-account-circle';
import icLocalOffer from '@iconify/icons-ic/twotone-local-offer';
import icShoppingCart from '@iconify/icons-ic/twotone-shopping-cart';
import icHome from '@iconify/icons-ic/twotone-home';
import icAdd from '@iconify/icons-ic/twotone-add';
import { Router } from '@angular/router';
import { EntidadService } from 'src/app/services/entidad.service';
import { MatDialog } from '@angular/material/dialog';
import { SedeSelectionComponent } from 'src/app/components/sede-selection/sede-selection.component';

@Component({
  selector: 'vex-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input() mobileQuery: boolean;

  @Input()
  @HostBinding('class.shadow-b')
  hasShadow: boolean;

  navigationItems = this.navigationService.items;

  isHorizontalLayout$ = this.configService.config$.pipe(map(config => config.layout === 'horizontal'));
  isVerticalLayout$ = this.configService.config$.pipe(map(config => config.layout === 'vertical'));
  isNavbarInToolbar$ = this.configService.config$.pipe(map(config => config.navbar.position === 'in-toolbar'));
  isNavbarBelowToolbar$ = this.configService.config$.pipe(map(config => config.navbar.position === 'below-toolbar'));

  icSearch = icSearch;
  icBookmarks = icBookmarks;
  emojioneUS = emojioneUS;
  emojioneDE = emojioneDE;
  icMenu = icMenu;
  icPersonAdd = icPersonAdd;
  icAssignmentTurnedIn = icAssignmentTurnedIn;
  icBallot = icBallot;
  icDescription = icDescription;
  icAssignment = icAssignment;
  icReceipt = icReceipt;
  icDoneAll = icDoneAll;
  icArrowDropDown = icArrowDropDown;
  icAccountCircle = icAccountCircle;
  icLocalOffer = icLocalOffer;
  icShoppingCart = icShoppingCart;
  icHome = icHome;
  icAdd = icAdd;

  sedes = [];
  sedeActual: any;

  constructor(private layoutService: LayoutService,
    private configService: ConfigService,
    private navigationService: NavigationService,
    private popoverService: PopoverService,
    private _matDialog: MatDialog,
    private _entidadService: EntidadService,
    private router: Router
  ) {
    this.sedes = this._entidadService.sedes;
    this.sedeActual = this.sedes.length > 0 ? this.sedes.filter(sede => sede.idsede === this._entidadService.sedeDefault)[0] : null;
    if (!this.sedeActual) {
      this.selectionSede(this.sedes);
    }
  }

  ngOnInit() {
  }

  seleccionarSede(id: number) {
    this._entidadService.setSede(id);
    this.sedeActual = this.sedes.length > 0 ? this.sedes.filter(sede => sede.idsede === this._entidadService.sedeDefault)[0] : null;
    this.router.navigate(['/inicio']);
  }

  selectionSede(sedes: any[]): void {

    const dialogRef = this._matDialog.open(SedeSelectionComponent, {
      panelClass: 'sede-selection-dialog',
      data: {
        sedes,
        salir: false
      },
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }

        this.sedeActual = this.sedes.filter(sede => sede.idsede === this._entidadService.sedeDefault)[0];
        this.router.navigate(['/inicio']);
      });
  }

  openQuickpanel() {
    this.layoutService.openQuickpanel();
  }

  // openConfigpanel() {
  //   this.layoutService.openConfigpanel();
  // }

  openSidenav() {
    this.layoutService.openSidenav();
  }

  openMegaMenu(origin: ElementRef | HTMLElement) {
    this.popoverService.open({
      content: MegaMenuComponent,
      origin,
      position: [
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ]
    });
  }

  openSearch() {
    this.layoutService.openSearch();
  }
}
