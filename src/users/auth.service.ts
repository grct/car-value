import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util"; // perchè scrypt ritorna un callback, noi vogliamo una promise

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) { }

    async signup(email: string, password: string) {
        // Mail già in uso?
        const users = await this.usersService.find(email)
        if (users.length)
            throw new BadRequestException('email in use');

        // Generiamo salt
        const salt = randomBytes(8).toString('hex'); // randomBytes ritorna un buffer, 8 bytes = 4 caratteri

        // Hash password + salt
        const hash = (await scrypt(password, salt, 32)) as Buffer; // 'as Buffer' per typescript (altrimenti ritorna type: Unknown)

        // Join
        const result = salt + '.' + hash.toString('hex')

        // Crea utente
        const user = await this.usersService.create(email, result);

        // return the user
        return user;
    }

    async signin(email: string, password: string) {
        const [user] = await this.usersService.find(email);
        if (!user)
            throw new NotFoundException('user not found');

        const [salt, storedHash] = user.password.split('.');

        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (storedHash !== hash.toString('hex'))
            throw new BadRequestException('bad password');

        return user;
    }
}