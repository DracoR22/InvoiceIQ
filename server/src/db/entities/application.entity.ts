import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { ApiKey } from "./api-key.entity";

@Entity()
export class Application {
    @PrimaryColumn('uuid')
    id: string

    @Column()
    name: string

    @OneToMany(() => ApiKey, (apiKey) => apiKey.application)
    apiKeys: Promise<ApiKey[]>
}

