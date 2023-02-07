import {
    UseInterceptors,
    NestInterceptor,
    ExecutionContext,
    CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

// Controllo per il costruttore: il parametro deve essere per forza una classe
interface ClassConstructor {
    new(...args: any[]): {}
}

export function Serialize(dto: any) {
    return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
    constructor(private dto: any) { }

    intercept(context: ExecutionContext, handler: CallHandler<any>): Observable<any> {
        // Esegue prima che la richiesta sia gestita dall'Handler

        return handler.handle().pipe(
            map((data: any) => {
                // Esegue prima che la risposta venga mandata fuori
                return plainToInstance(this.dto, data, {
                    excludeExtraneousValues: true, // Esclude tutte le variabili senza @Expose
                })
            })
        )
        // Esegue dopo l'intervento dell'Handler
    }
}