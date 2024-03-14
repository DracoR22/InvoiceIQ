import { Module } from "@nestjs/common";
import { LLMService } from "./llm/services/llm.service";
import { JsonService } from "./json/services/json.service";
import { JsonController } from "./json/controllers/json.controller";

@Module({
    providers: [LLMService, JsonService],
    controllers: [JsonController]
})
export class OrganizedDataModule {}