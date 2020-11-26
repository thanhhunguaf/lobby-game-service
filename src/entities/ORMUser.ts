import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: 'users'})
export class ORMUser {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    online: boolean
}



