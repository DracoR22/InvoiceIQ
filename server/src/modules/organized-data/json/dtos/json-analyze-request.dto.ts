import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsBoolean, IsObject, IsOptional } from "class-validator";

export enum AnalysisModel {
    GPT_3_5_TURBO = 'gpt-3.5-turbo'
}

export class JsonAnalizeRequestDto {
    @ApiProperty({
        description: 'model to use for analysis of the generated json',
        type: 'object',
        properties: {
          apiKey: {
            type: 'string',
            description: 'api key of the model',
            nullable: true,
          },
          name: {
            type: 'string',
            description: 'name of the model',
            default: 'gpt-3.5-turbo',
          },
        },
      })
    @IsObject()
      model: {
        apiKey?: string;
        name: string;
    };

    @ApiProperty({ description: 'Original text from which the json was generated' })
    originalText: string

    @ApiProperty({ description: 'Json output from the data extraction' })
    jsonOutput: string

    @ApiProperty({ description: 'Json schema used for out model for data extraection' })
    jsonSchema: string

    @ApiPropertyOptional({ description: 'if a debug report of the json extraction should be generated', default: false, required: false})
    @IsBoolean()
    @IsOptional()
    debug?: boolean;
}