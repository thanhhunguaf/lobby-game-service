import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: 'profiles'})
export class ORMProfile {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    user_id: number
}



