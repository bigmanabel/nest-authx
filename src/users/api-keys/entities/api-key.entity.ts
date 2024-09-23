import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('api-keys')
export class ApiKey { 
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    uuid: string;

    @ManyToOne((type) => User, (user) => user.apiKeys)
    user: User;

    // @Column()
    // scopes: Scope[];
}
