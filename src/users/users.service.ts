import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private repo: Repository<User>) { }

    create(email: string, password: string) {
        // Creo un'entità al posto di passare un semplice obj,
        // altrimenti gli Hooks non vengono eseguiti (debug + difficile)
        const user = this.repo.create({ email, password });

        return this.repo.save(user)
    }

    findOne(id: number) {
        if (!id)
            throw new BadRequestException('invalid id');
        return this.repo.findOneBy({ id })
    }

    find(email: string) {
        return this.repo.find({ where: { email } });
    }

    //.save e .remove perchè lavorano con le entità (però richiede un fetch dal db)
    // Partial<User> = Type helper = ogni oggetto che ha n propietà di User
    async update(id: number, attrs: Partial<User>) {
        const user = await this.findOne(id);
        if (!user)
            throw new NotFoundException('user not found');
        Object.assign(user, attrs);
        return this.repo.save(user)
    }

    async remove(id: number) {
        const user = await this.findOne(id);
        if (!user)
            throw new NotFoundException('user not found');
        return this.repo.remove(user)
    }
}
