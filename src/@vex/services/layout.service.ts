import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { BreakpointObserver } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private _quickpanelOpenSubject = new BehaviorSubject<boolean>(false);
  quickpanelOpen$ = this._quickpanelOpenSubject.asObservable();

  private _sidenavOpenSubject = new BehaviorSubject<boolean>(false);
  sidenavOpen$ = this._sidenavOpenSubject.asObservable();

  private _sidenavCollapsedSubject = new BehaviorSubject<boolean>(false);
  sidenavCollapsed$ = this._sidenavCollapsedSubject.asObservable();

  private _sidenavCollapsedOpenSubject = new BehaviorSubject<boolean>(false);
  sidenavCollapsedOpen$ = this._sidenavCollapsedOpenSubject.asObservable();

  private _configpanelOpenSubject = new BehaviorSubject<boolean>(false);
  configpanelOpen$ = this._configpanelOpenSubject.asObservable();

  private _searchOpen = new BehaviorSubject<boolean>(false);
  searchOpen$ = this._searchOpen.asObservable();

  isDesktop$ = this.breakpointObserver.observe(`(min-width: 1200px)`).pipe(
    map(state => state.matches)
  );

  constructor(private router: Router,
              private breakpointObserver: BreakpointObserver) { }

  openQuickpanel() {
    this._quickpanelOpenSubject.next(true);
  }

  closeQuickpanel() {
    this._quickpanelOpenSubject.next(false);
  }

  openSidenav() {
    this._sidenavOpenSubject.next(true);
  }

  closeSidenav() {
    this._sidenavOpenSubject.next(false);
  }

  collapseSidenav() {
    this._sidenavCollapsedSubject.next(true);
  }

  expandSidenav() {
    this._sidenavCollapsedSubject.next(false);
  }

  collapseOpenSidenav() {
    this._sidenavCollapsedOpenSubject.next(true);
  }

  collapseCloseSidenav() {
    this._sidenavCollapsedOpenSubject.next(false);
  }

  openConfigpanel() {
    this._configpanelOpenSubject.next(true);
  }

  closeConfigpanel() {
    this._configpanelOpenSubject.next(false);
  }

  openSearch() {
    this._searchOpen.next(true);
  }

  closeSearch() {
    this._searchOpen.next(false);
  }

  enableRTL() {
    this.router.navigate([], {
      queryParams: {
        rtl: 'true'
      }
    });
  }

  disableRTL() {
    this.router.navigate([], {
      queryParams: {
        rtl: 'false'
      }
    });
  }
}
