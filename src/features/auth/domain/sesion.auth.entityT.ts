import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEnity } from '../../user/domain/entity.user.entityT';





@Entity({ name: 'deviceSesions' })
export class SesionEntity {
    @PrimaryGeneratedColumn('uuid')
    deviceId: string;

    @Column()
    ip: string;

    @Column()
    lastActiveDate: string;

    @Column()
    title: string;

    @ManyToOne(() => UserEnity, (UserEnity) => UserEnity.sessions, {
        onDelete: 'CASCADE', // Связанные записи будут удаляться вместе с пользователем
    })
    @JoinColumn({ name: 'userIdFk' })
    user: UserEnity;

}
