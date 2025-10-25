import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ItemStatusEnum } from "../enums/itemStatus.enum";


@Entity()
export class Item {

  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Column({ type: 'text', nullable: false, unique: true})
  name:string

  @Column({
    type: 'enum',
    enum: ItemStatusEnum,
    default: ItemStatusEnum.todo,
    nullable: false })

  status?: ItemStatusEnum

  @Column({ type: 'text', nullable: true})
  description?: string

  @CreateDateColumn({type: 'timestamp', nullable: false})
  createdAt?: Date

  @UpdateDateColumn({type: 'timestamp', nullable: true})
  updatedAt?: Date


}

