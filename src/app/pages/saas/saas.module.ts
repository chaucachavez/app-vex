import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginGuardGuard } from 'src/app/guards/login-guard.guard';

const routes = [
    {
        path: 'configuracion',
        loadChildren: () => import('./configuracion/configuracion.module').then(m => m.ConfiguracionModule),
        canActivate: [LoginGuardGuard]
    },
    {
        path: 'ventas',
        loadChildren: () => import('./ventas/ventas.module').then(m => m.VentasModule),
    },
    {
        path: 'afiliados',
        loadChildren: () => import('./afiliado/afiliado.module').then(m => m.AfiliadoModule),
    },
    {
        path: 'clientes',
        loadChildren: () => import('./cliente/cliente.module').then(m => m.ClienteModule),
    },
    {
        path: 'personal',
        loadChildren: () => import('./personal/personal.module').then(m => m.PersonalModule),
    },
    {
        path: 'proveedores',
        loadChildren: () => import('./proveedor/proveedor.module').then(m => m.ProveedorModule),
    },
    {
        path: 'reportes',
        loadChildren: () => import('./reportes/reportes.module').then(m => m.ReportesModule),
    },
    {
        path: 'inicio',
        loadChildren: () => import('./inicio/inicio.module').then(m => m.InicioModule),
        canActivate: [LoginGuardGuard]
    },
    {
        path: 'empresa',
        loadChildren: () => import('./config/empresa.module').then(m => m.EmpresaModule),
    },
    {
        path: 'productos',
        loadChildren: () => import('./items/items.module').then(m => m.ItemsModule),
    },
    {
        path: 'locales',
        loadChildren: () => import('./sede/sede.module').then(m => m.SedeModule),
    },
    {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.module').then(m => m.UsuariosModule),
    },
    {
        path: 'tipo-de-cambio',
        loadChildren: () => import('./tipo-cambio/tipo-cambio.module').then(m => m.TipoCambioModule),
    },
    {
        path: 'mi-cuenta',
        loadChildren: () => import('./cuenta/cuenta.module').then(m => m.CuentaModule),
    },
    {
        path: 'cotizaciones',
        loadChildren: () => import('./cotizacion/cotizacion.module').then(m => m.CotizacionModule),
    },
    {
        path: 'guias-de-remision',
        loadChildren: () => import('./guia-remision/guia-remision.module').then(m => m.GuiaRemisionModule)
    },
    {
        path: 'notas-de-salida',
        loadChildren: () => import('./nota-salida/nota-salida.module').then(m => m.NotaSalidaModule)
    },
    {
        path: 'lotes',
        loadChildren: () => import('./masivo/masivo.module').then(m => m.MasivoModule)
    },
    {
        path: 'compras',
        loadChildren: () => import('./compras/compras.module').then(m => m.ComprasModule)
    },
    {
        path: 'categorias',
        loadChildren: () => import('./categoria/categoria.module').then(m => m.CategoriaModule)
    },
    {
        path: 'anulaciones',
        loadChildren: () => import('./anulaciones/anulaciones.module').then(m => m.AnulacionesModule)
    },
    {
        path: 'resumenes',
        loadChildren: () => import('./resumenes/resumenes.module').then(m => m.ResumenesModule)
    },
    {
        path: 'contingencias',
        loadChildren: () => import('./contingencias/contingencias.module').then(m => m.ContingenciasModule)
    },
    {
        path: 'empresas',
        loadChildren: () => import('./empresa/empresa.module').then(m => m.EmpresaModule)
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    declarations: []
})
export class SaasModule {
    constructor() {
        console.log('Cargado SaasModule');
    }
}
