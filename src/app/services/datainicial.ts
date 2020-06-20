import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class DataInicial {

    public mediosdepago: any[] = [
        { idmediopago: 1, nombre: 'Efectivo' },
        { idmediopago: 2, nombre: 'Tarjeta débito' },
        { idmediopago: 3, nombre: 'Tarjeta crédito' },
        { idmediopago: 4, nombre: 'Depósito' },
        { idmediopago: 5, nombre: 'Giro' },
        { idmediopago: 6, nombre: 'Cupón' },
        { idmediopago: 7, nombre: 'Otros' },
    ];

    public operaciones: any[] = [
        { operacion: 1, nombre: 'Venta interna' },
        // { operacion: 4, nombre: 'Venta interna - anticipos' }, // Proximamente
        // { operacion: 2, nombre: 'Exportación' }, // POR IMPLEMENTAR
        // { operacion: 14, nombre: 'Ventas no domiciliadas' }, // POR IMPLEMENTAR
    ];

    public formatos: any[] = [
        { id: 'A4', nombre: 'A4' },
        { id: 'A5', nombre: 'A5' },
        { id: 'TICKET', nombre: 'Ticket' }
    ];

    public comprobantenc: any[] = [
        { iddocumentofiscal: 1, nombre: 'Factura' },
        { iddocumentofiscal: 2, nombre: 'Boleta de venta' }
    ];

    public tiponc: any[] = [
        { id: 1, nombre: 'Anulación de la operación' },
        { id: 2, nombre: 'Anulación por error en el Ruc' },
        { id: 3, nombre: 'Corrección por error en la descripción' },
        { id: 4, nombre: 'Descuento global' },
        { id: 5, nombre: 'Descuento por ítem' },
        { id: 6, nombre: 'Devolución total' },
        { id: 7, nombre: 'Devolución por ítem' },
        { id: 8, nombre: 'Bonificación' },
        { id: 9, nombre: 'Disminución en el valor' }
    ];

    public tipond: any[] = [
        { id: 1, nombre: 'Intereses por mora' },
        { id: 2, nombre: 'Aumento de valor' },
        { id: 3, nombre: 'Penalidades' }
    ];

    public monedas: any[] = [
        { moneda: 'PEN', nombre: 'S/' },
        { moneda: 'USD', nombre: '$' },
        { moneda: 'EUR', nombre: '€' }
    ];

    public documentos: any[] = [
        { iddocumento: 1, nombre: 'DNI' },
        { iddocumento: 2, nombre: 'RUC' },
        { iddocumento: 4, nombre: 'C.E.', },
        { iddocumento: 3, nombre: 'PASAPORTE' },
        { iddocumento: 5, nombre: 'VARIOS - VENTAS MENORES A S/.700.00' },
        { iddocumento: 6, nombre: 'NO DOMICILIADO' },
        { iddocumento: 7, nombre: 'CÉDULA DIPLOMÁTICA' }
    ];

    public impuestos: any[] = [
        { idimpuesto: 1, nombre: 'Igv' },
        { idimpuesto: 8, nombre: 'Exonerado' },
        { idimpuesto: 9, nombre: 'Inafecto' },
        { idimpuesto: 2, nombre: 'Gratuita' }
    ];

    // public impuestos: any[] = [
    //     { idimpuesto: 1, nombre: 'Gravado - Operación Onerosa' },
    //     { idimpuesto: 2, nombre: '[Gratuita] Gravado – Retiro por premio' },
    //     { idimpuesto: 3, nombre: '[Gratuita] Gravado – Retiro por donación' },
    //     { idimpuesto: 4, nombre: '[Gratuita] Gravado – Retiro' },
    //     { idimpuesto: 5, nombre: '[Gratuita] Gravado – Retiro por publicidad' },
    //     { idimpuesto: 6, nombre: '[Gratuita] Gravado – Bonificaciones' },
    //     { idimpuesto: 7, nombre: '[Gratuita] Gravado – Retiro por entrega a trabajadores' },
    //     { idimpuesto: 8, nombre: 'Exonerado - Operación Onerosa' },
    //     { idimpuesto: 9, nombre: 'Inafecto - Operación Onerosa' },
    //     { idimpuesto: 10, nombre: '[Gratuita] Inafecto – Retiro por Bonificación' },
    //     { idimpuesto: 11, nombre: '[Gratuita] Inafecto – Retiro' },
    //     { idimpuesto: 12, nombre: '[Gratuita] Inafecto – Retiro por Muestras Médicas' },
    //     { idimpuesto: 13, nombre: '[Gratuita] Inafecto - Retiro por Convenio Colectivo' },
    //     { idimpuesto: 14, nombre: '[Gratuita] Inafecto – Retiro por premio' },
    //     { idimpuesto: 15, nombre: '[Gratuita] Inafecto - Retiro por publicidad' },
    //     { idimpuesto: 16, nombre: 'Exportación' }
    // ];
}
