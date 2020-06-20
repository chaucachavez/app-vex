import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomLayoutComponent } from './custom-layout/custom-layout.component';
import { HolaMundoComponent } from './hola-mundo/hola-mundo.component';
import { LoginGuardGuard } from './guards/login-guard.guard';
import { VexRoutes } from 'src/@vex/interfaces/vex-route.interface';


const childrenRoutes: VexRoutes = [
  {
    path: '',
    redirectTo: 'dashboards/analytics',
    // redirectTo: 'login', // Genera error
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () => import('./pages/saas/saas.module').then(m => m.SaasModule),
    canActivate: [LoginGuardGuard]
  },
];

const routes: Routes = [
  // {
  //   path: '',
  //   component: CustomLayoutComponent,
  //   children: []
  // },
  // {
  //   path: '',
  //   loadChildren: () => import('./pages/saas/saas.module').then(m => m.SaasModule),
  //   canActivate: [LoginGuardGuard]
  // },
  {
    path: 'hola',
    component: HolaMundoComponent
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/pages/auth/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/pages/auth/register/register.module').then(m => m.RegisterModule),
  },
  {
    path: 'recuperar-contrasena',
    loadChildren: () => import('./pages/pages/auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule),
  },
  {
    path: 'generar-contrasena/:forgottoken',
    loadChildren: () => import('./pages/pages/auth/generate-password/generate-password.module').then(m => m.GeneratePasswordModule),
  },
  {
    path: '',
    component: CustomLayoutComponent,
    children: childrenRoutes
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'corrected',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
