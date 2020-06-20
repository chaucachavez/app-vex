import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class Utils {

    public estructuraColeccion(tmpdata, quiebre, columna, valor, columnQuiebre, columnColumna, countItem = false, sumItem = false): {
        data: {}, header: {}
    } {

        const coleccionidquiebre = [];
        const coleccionquiebre = [];

        const coleccionidcolumna = [];
        const coleccioncolumna = [];

        const coleccionquiebre_columna = [];
        let item = 1;
        let sum = 0;

        tmpdata.forEach(row => {

            if (!coleccionquiebre_columna[String(row[quiebre])]) {
                coleccionquiebre_columna[String(row[quiebre])] = {};
            }

            if (!coleccionquiebre_columna[String(row[quiebre])]['column']) {
                coleccionquiebre_columna[String(row[quiebre])]['column'] = {};
            }

            coleccionquiebre_columna[String(row[quiebre])]['column'][String(row[columna])] = row[valor];

            if (coleccionidquiebre.indexOf(row[quiebre]) === -1) {
                coleccionidquiebre.push(row[quiebre]);

                const objeto = {};
                if (countItem) {
                    objeto['item'] = item;
                    item++;
                }

                columnQuiebre.forEach(column => {
                    const myarr = column.split('.');
                    switch (myarr.length) {
                        case 1:
                            objeto[myarr[0]] = row[myarr[0]];
                            break;
                        case 2:
                            objeto[myarr[0] + '_' + myarr[1]] = row[myarr[0]][myarr[1]];
                            break;
                        case 3:
                            objeto[myarr[0] + '_' + myarr[1] + '_' + myarr[2]] = row[myarr[0]][myarr[1]][myarr[2]];
                            break;
                        default:
                            break;
                    }
                });

                if (sumItem) {
                    objeto['sum'] = null;
                }
                coleccionquiebre.push(objeto);
            }

            if (coleccionidcolumna.indexOf(row[columna]) === -1) {
                coleccionidcolumna.push(row[columna]);
                const objeto = {};
                columnColumna.forEach(column => {
                    // objeto[column] = row[column]; 
                    const myarr = column.split('.');
                    switch (myarr.length) {
                        case 1:
                            objeto[myarr[0]] = row[myarr[0]];
                            break;
                        case 2:
                            objeto[myarr[0] + '_' + myarr[1]] = row[myarr[0]][myarr[1]];
                            break;
                        case 3:
                            objeto[myarr[0] + '_' + myarr[1] + '_' + myarr[2]] = row[myarr[0]][myarr[1]][myarr[2]];
                            break;
                        default:
                            break;
                    }
                });

                if (sumItem) {
                    objeto['sum'] = null;
                }

                coleccioncolumna.push(objeto);
            }
        });

        coleccionquiebre.forEach(row => {
            coleccioncolumna.forEach(row2 => {
                row['column_' + row2[columna]] = null;
            });
        });

        coleccionquiebre.forEach(objeto => {
            sum = 0;
            for (const i of objeto) {
                const res = i.split('_');

                if (res[0] === 'column') {
                    // if (objeto.hasOwnProperty(i))            
                    const cantidad = coleccionquiebre_columna[objeto[quiebre]]['column'][res[1]];
                    if (cantidad) {
                        objeto[i] = cantidad;
                        sum += cantidad;
                    }
                }
            }

            if (sumItem) {
                objeto.sum = sum;
            }
        });

        if (sumItem) {
            coleccioncolumna.forEach(objeto => {
                sum = 0;
                coleccionquiebre_columna.forEach(row => {
                    if (row['column'][objeto[columna]]) {
                        sum += row['column'][objeto[columna]];
                    }
                });
                objeto.sum = sum;
            });
        }

        return { data: coleccionquiebre, header: coleccioncolumna };
    }

    public calculateAge(birthday): number {
        const ageDifMs = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    public calculateImc(talla: any, peso: any): number {
        const tallam = parseFloat(talla);
        const pesokg = parseFloat(peso);

        return this.redondearValor(Math.abs(pesokg / (tallam * tallam)), 2);
    }

    public redondearValor(valor: any, precision: any): number {

        if (precision > 0) {
            const rounded = Math.round(parseFloat((valor * Math.pow(10, precision)).toFixed(precision))) / Math.pow(10, precision);
            const numero = rounded.toFixed(precision);
            return parseFloat(numero);
        } else {
            return Math.round(valor);
        }
    }

    public fechaInicioFin(fecha: string, horainicio: string, horafin: string): any {
        // 2018-10-30
        const d = fecha.substr(8, 2);
        const m = parseInt(fecha.substr(5, 2), 10) - 1;
        const y = fecha.substr(0, 4);

        const Hi = horainicio.substr(0, 2);
        const Mi = horainicio.substr(3, 2);
        const Si = horainicio.substr(6, 2);

        const Hf = horafin.substr(0, 2);
        const Mf = horafin.substr(3, 2);
        const Sf = horafin.substr(6, 2);

        return {
            d: d, m: m, y: y,
            Hi: Hi, Mi: Mi, Si: Si,
            Hf: Hf, Mf: Mf, Sf: Sf
        };
    }

    public convertDate(fecha: string, hora?: string): Date {
        // fecha: 1986-07-08
        // hora: 15:02:54
        const d = parseInt(fecha.substr(8, 2), 10);
        const m = parseInt(fecha.substr(5, 2), 10) - 1;
        const y = parseInt(fecha.substr(0, 4), 10);

        if (fecha && hora) {
            const hh = parseInt(hora.substr(0, 2), 10);
            const mm = parseInt(hora.substr(3, 2), 10);
            const ss = parseInt(hora.substr(6, 2), 10);
            return new Date(y, m, d, hh, mm, ss);
        }

        if (fecha) {
            return new Date(y, m, d);
        }
    }

    public sumDate(fecha: Date, hora: string): Date {
        // https://parzibyte.me/blog/2018/05/14/sumar-restar-fechas-javascript/
        const hh = parseInt(hora.substr(0, 2), 10) * 1000 * 60 * 60;
        const mm = parseInt(hora.substr(3, 2), 10) * 1000 * 60;
        const ss = parseInt(hora.substr(6, 2), 10) * 1000;

        return new Date(fecha.getTime() + hh + mm + ss);
    }

    public resDate(fecha: Date, hora: string): void {
        // https://parzibyte.me/blog/2018/05/14/sumar-restar-fechas-javascript/ 
    }

    public convertError(value: any): string {

        let mensaje = '';
        if (typeof value === 'string') {
            mensaje = value;
            return mensaje;
        }

        if (value.hasOwnProperty('error') && value.error.hasOwnProperty('error') && typeof value.error.error === 'string') {
            mensaje = value.error.error;
            return mensaje;
        }

        if (value.hasOwnProperty('error') && value.error.hasOwnProperty('error') && typeof value.error.error === 'object') {
            for (const prop in value.error.error) {
                if (value.error.error.hasOwnProperty(prop)) {
                    mensaje += ' ' + value.error.error[prop];
                }
            }
            return mensaje;
        }

        if (value.hasOwnProperty('error') && value.error.hasOwnProperty('message') && typeof value.error.message === 'string') {
            mensaje = value.error.message;
            return mensaje;
        }

        if (typeof value === 'object') {
            for (const prop in value) {
                if (value.hasOwnProperty(prop)) {
                    mensaje += ' ' + value[prop];
                }
            }
        }

        return mensaje;
    }

    public existValue(data: any[], key: string, value: any): boolean {

        let existe = false;
        data.forEach(item => {
            if (item[key] === value) {
                existe = true;
            }
        });

        return existe;
    }

    public calculoLinea(idimpuesto: number, preciounit: number, cantidad: number, descuento?: number, descuentoporcentaje?: number): any {

        idimpuesto = idimpuesto || 1; // IGV
        preciounit = preciounit || 0;
        cantidad = cantidad || 0;
        descuento = descuento || 0;

        cantidad = this.redondearValor(cantidad, 3);
        descuento = this.redondearValor(descuento, 3);
        preciounit = this.redondearValor(preciounit, 3);

        let valorunit: number;
        let subtotal: number;
        let montototalimpuestos: number;
        let total: number;

        if (idimpuesto === 1) { // Gravado - Operación Onerosa
            const precioxcant = preciounit * cantidad;
            valorunit = this.redondearValor(preciounit / 1.18, 3);
            subtotal = this.redondearValor(precioxcant / 1.18, 9); // Excel toma 9 decimales.
            // Ejemplo Cant: 1 P.Unit: 2 Descuento: 2. Ifact vs Nubefact ahora es igual.

            if (descuento > 0) {
                subtotal -= descuento;
            }

            montototalimpuestos = this.redondearValor(subtotal * 0.18, 2);

            total = 0;
            if (descuento > 0) {
                total = this.redondearValor(subtotal + montototalimpuestos, 2);
            } else {
                total = this.redondearValor(precioxcant, 2);
            }

            // Ajuste al sub total
            const temp = subtotal + montototalimpuestos;
            if (total > temp) {
                subtotal += total - temp;
            }

            if (total < temp) {
                subtotal -= temp - total;
            }
            subtotal = this.redondearValor(subtotal, 2);
            // Ajuste
        }

        if ([2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15].indexOf(idimpuesto) !== -1) { // Gratuita
            const precioxcant = preciounit * cantidad;
            valorunit = preciounit;
            subtotal = this.redondearValor(precioxcant - descuento, 2);
            montototalimpuestos = 0;
            total = subtotal;
        }

        if (idimpuesto === 8) { // Exonerado - Operación Onerosa
            const precioxcant = preciounit * cantidad;
            valorunit = preciounit;
            subtotal = this.redondearValor(precioxcant - descuento, 2);
            montototalimpuestos = 0;
            total = subtotal;
        }

        if (idimpuesto === 9) { // Inafecto - Operación Onerosa
            const precioxcant = preciounit * cantidad;
            valorunit = preciounit;
            subtotal = this.redondearValor(precioxcant - descuento, 2);
            montototalimpuestos = 0;
            total = subtotal;
        }

        if (idimpuesto === 16) { // Exportación
            // NO SE LA LOGICA DE EXPORTACION
        }

        return {
            idimpuesto,
            cantidad,
            valorunit,
            preciounit,
            subtotal,
            descuento,
            montototalimpuestos,
            total
        };
    }

    public calculoLineaT(idimpuesto: number, total: number, cantidad: number, descuento?: number, descuentoporcentaje?: number): any {

        idimpuesto = idimpuesto || 1; // IGV
        // preciounit = preciounit || 0;
        cantidad = cantidad || 0;
        descuento = descuento || 0;
        total = total || 0;

        cantidad = this.redondearValor(cantidad, 3);
        descuento = this.redondearValor(descuento, 3);
        total = this.redondearValor(total, 2);

        let valorunit: number;
        let subtotal: number;
        let montototalimpuestos: number;
        // let total: number;
        let preciounit: number;

        if (idimpuesto === 1) { // Gravado - Operación Onerosa

            preciounit = this.redondearValor(total / cantidad, 3);
            const precioxcant = preciounit * cantidad;

            valorunit = this.redondearValor(preciounit / 1.18, 3);
            subtotal = this.redondearValor(precioxcant / 1.18, 9); // Excel toma 9 decimales.
            // Ejemplo Cant: 1 P.Unit: 2 Descuento: 2. Ifact vs Nubefact ahora es igual.

            if (descuento > 0) {
                subtotal -= descuento;
            }

            montototalimpuestos = this.redondearValor(subtotal * 0.18, 2);

            // total = 0;
            // if (descuento > 0) {
            //     total = this.redondearValor(subtotal + montototalimpuestos, 2);
            // } else {
            //     total = this.redondearValor(precioxcant, 2);
            // }

            // Ajuste al sub total
            const temp = subtotal + montototalimpuestos;
            if (total > temp) {
                subtotal += total - temp;
            }

            if (total < temp) {
                subtotal -= temp - total;
            }
            subtotal = this.redondearValor(subtotal, 2);
            // Ajuste
        }

        if ([2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15].indexOf(idimpuesto) !== -1) { // Gratuita
            const precioxcant = preciounit * cantidad;
            valorunit = preciounit;
            subtotal = this.redondearValor(precioxcant - descuento, 2);
            montototalimpuestos = 0;
            total = subtotal;
        }

        if (idimpuesto === 8) { // Exonerado - Operación Onerosa
            preciounit = this.redondearValor(total / cantidad, 3);
            const precioxcant = preciounit * cantidad;
            valorunit = preciounit;
            subtotal = this.redondearValor(precioxcant - descuento, 2);
            montototalimpuestos = 0;
            total = subtotal;
        }

        if (idimpuesto === 9) { // Inafecto - Operación Onerosa
            const precioxcant = preciounit * cantidad;
            valorunit = preciounit;
            subtotal = this.redondearValor(precioxcant - descuento, 2);
            montototalimpuestos = 0;
            total = subtotal;
        }

        if (idimpuesto === 16) { // Exportación
            // NO SE LA LOGICA DE EXPORTACION
        }

        // descuento = descuento > 0 ? descuento : null;

        return {
            idimpuesto,
            cantidad,
            valorunit,
            preciounit,
            subtotal,
            descuento,
            montototalimpuestos,
            total
        };
    }

    public convertHMS(value: any) {
        // https://www.4codev.com/javascript/convert-seconds-to-time-value-hours-minutes-seconds-idpx6943853585885165320.html
        console.log('value', value);
        const sec = parseInt(value, 10); // convert value to number if it's string
        console.log('sec', sec);
        let hours: any = Math.floor(sec / 3600); // get hours
        let minutes: any = Math.floor((sec - (hours * 3600)) / 60); // get minutes
        let seconds: any = sec - (hours * 3600) - (minutes * 60); //  get seconds

        // add 0 if value < 10
        if (hours < 10) { hours = '0' + hours; }
        if (minutes < 10) { minutes = '0' + minutes; }
        if (seconds < 10) { seconds = '0' + seconds; }

        return hours + ':' + minutes + ':' + seconds; // Return is HH : MM : SS
    }

}
