import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEnity } from './entity.user';



@Entity({ name: 'emailConfirmation' })
export class EmailConfirmation {
    @PrimaryGeneratedColumn()
    emailConfirmationId: number;

    @Column({ type: 'timestamp' })
    expirationDate: Date;

    @Column()
    confirmationCode: string;

    @Column()
    isConfirmed: boolean;

    @OneToOne(() => UserEnity, (user) => user.emailConfirmation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fk_users_id' })
    user: UserEnity;
}
