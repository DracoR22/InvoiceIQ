import { Injectable } from "@nestjs/common";
import { LLMService } from "../../llm/services/llm.service";
import { jsonOneShotExtraction, jsonZeroShotSchemaExtraction, jsonZeroShotSchemaExtractionRefine } from "../prompts/prompts";
import { InvalidJsonOutputError } from "../exceptions/exceptions";
import { RefineParams } from "../types/types";

@Injectable()
export class JsonService {
    constructor(
        private llmService: LLMService
    ) {}
//--------------------------------------------------------//PRIVATE FUNCTIONS//--------------------------------------------------------------//
    private defaultRefineParams: RefineParams = {
        chunkSize: 2000,
        overlap: 100
    }
//-------------------------------------------------------//TURN TEXT INTO JSON//-------------------------------------------------------------//    
    async extractWithSchema(text: string, model: string, schema: string) {
        const output = await this.llmService.generateOutput(model, jsonZeroShotSchemaExtraction, {
            context: text,
            jsonSchema: schema
        })

        try {
            const json: object = JSON.parse(output.text)
            return json
        } catch (error) {
            throw new InvalidJsonOutputError()
        }
    }

//-----------------------------------------------------//TURN TEXT INTO JSON AND REFINE//-----------------------------------------------------//
    async extractWithSchemaAndRefine(text: string, model: string, schema: string, refineParams?: RefineParams) {
        const params = refineParams || this.defaultRefineParams
        const documents = await this.llmService.splitDocument(text, params)

        const output = await this.llmService.generateRefineOutput(model, jsonZeroShotSchemaExtraction, jsonZeroShotSchemaExtractionRefine, {
            input_documents: documents,
            jsonSchema: schema
        })

        try {
            const json: object = JSON.parse(output.output_text)
            return json
        } catch (error) {
            throw new InvalidJsonOutputError()
        }
    }

    async extractWithExample(text: string, model: string, example: { input: string; output: string }) {
        const output = await this.llmService.generateOutput(model, jsonOneShotExtraction, {
            context: text,
            exampleInput: example.input,
            exampleOutput: example.output
        })

        try {
            const json: object = JSON.parse(output.text)
            return json
        } catch (error) {
            throw new InvalidJsonOutputError()
        }
    }
}