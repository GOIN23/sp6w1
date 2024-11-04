import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';




@Entity({ name: 'recoveryPassword' })
export class RecoveryPassword {
    @PrimaryGeneratedColumn()
    recoveryPasswordId: string;

    @Column()
    code: string;

    @Column()
    email: string;


}
