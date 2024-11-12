import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';




@Entity({ name: 'questions' })
export class QuestionsEntity {
    @PrimaryGeneratedColumn()
    questionsId: number;

    @Column()
    body: string

    @Column({ type: 'text', array: true })
    correctAnswers: string[]

    @Column()
    published: boolean

    @Column()
    createdAt: string

    @Column({ nullable: true })
    updatedAt: string | null


}
