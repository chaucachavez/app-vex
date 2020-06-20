import { Component, OnInit } from '@angular/core';

import icAttachMoney from '@iconify/icons-ic/twotone-attach-money';
import icPerson from '@iconify/icons-ic/twotone-person';
import icGroup from '@iconify/icons-ic/twotone-group';
import icSettings from '@iconify/icons-ic/twotone-settings';
import icDomain from '@iconify/icons-ic/twotone-domain';
import icHome from '@iconify/icons-ic/twotone-home';
import icPrint from '@iconify/icons-ic/twotone-print';

@Component({
  selector: 'vex-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {

  icAttachMoney = icAttachMoney;
  icPerson = icPerson;
  icGroup = icGroup;
  icSettings = icSettings;
  icDomain = icDomain;
  icHome = icHome;
  icPrint = icPrint;

  constructor() { }

  ngOnInit(): void {
  }

}
