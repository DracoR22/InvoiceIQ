import { Injectable } from "@nestjs/common";
import { LLMService } from "../../llm/services/llm.service";
import { jsonAnalysis, jsonClassification, jsonOneShotExtraction, jsonZeroShotSchemaExtraction, jsonZeroShotSchemaExtractionRefine } from "../prompts/prompts";
import { InvalidJsonOutputError } from "../exceptions/exceptions";
import { RefineParams } from "../types/types";
import { Analysis } from "../dtos/json-analyze-result.dto";
import { Model } from "../../llm/types/types";
import { Classification } from "../dtos/json-classification-result.dto";
import { PromptTemplate } from "langchain/prompts";

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
    async extractWithSchema(text: string, model: Model, schema: string, debug = false) {
        const { output, debugReport } = await this.llmService.generateOutput(model, jsonZeroShotSchemaExtraction, {
            context: text,
            jsonSchema: schema
        }, debug)

        try {
            const json: object = JSON.parse(output.text)
            return { json, debugReport }
        } catch (error) {
            throw new InvalidJsonOutputError()
        }
    }

//-----------------------------------------------------//TURN TEXT INTO JSON AND REFINE//-----------------------------------------------------//
    async extractWithSchemaAndRefine(text: string, model: Model, schema: string, refineParams?: RefineParams, debug = false) {
        const params = refineParams || this.defaultRefineParams
        const documents = await this.llmService.splitDocument(text, params)

        const { output, llmCallCount, debugReport } = await this.llmService.generateRefineOutput(model, jsonZeroShotSchemaExtraction, jsonZeroShotSchemaExtractionRefine, {
            input_documents: documents,
            jsonSchema: schema
        }, debug)

        try {
            const json: object = JSON.parse(output.output_text)
            return {json, refineRecap: { ...params, llmCallCount }, debugReport}
        } catch (error) {
            throw new InvalidJsonOutputError()
        }
    }

//-------------------------------------------------//TURN TEXT INTO JSON EXAMPLE//---------------------------------------------------------//
    async extractWithExample(text: string, model: Model, example: { input: string; output: string }, debug = false) {
        const { output, debugReport } = await this.llmService.generateOutput(model, jsonOneShotExtraction, {
            context: text,
            exampleInput: example.input,
            exampleOutput: example.output
        }, debug)

        try {
            const json: object = JSON.parse(output.text)
            return { json, debugReport }
        } catch (error) {
            throw new InvalidJsonOutputError()
        }
    }

//-----------------------------------------------//ANALIZE JSON AND RETURN ITS CORRECTIONS//----------------------------------------------//
    async analizeJsonOutput(model: Model, jsonOutput: string, originalText: string, schema: string, debug = false) {
        const outputFormat: Analysis = {
            corrections: [
                {
                    field: 'the field in the generated JSON that needs to be corrected',
                    issue: 'the issue you identified',
                    description: 'your description of the issue, give your full reasoning for why it is an issue',
                    suggestion: 'your suggestion for correction',
                }
            ],
            textAnalysis: 'Your detailed and precise analysis, exposing your whole thought process, step by step. Do not provide a corrected JSON output in this field. Generate a readable text in markdown.'
        }

        const { output, debugReport } = await this.llmService.generateOutput(model, jsonAnalysis, {
            jsonSchema: schema,
            originalText,
            jsonOutput,
            outputFormat: JSON.stringify(outputFormat),
        }, debug)

        try {
            const json: Analysis = JSON.parse(output.text)

            if (Array.isArray(json.corrections) && json.corrections.every((correction) => (
                typeof correction.field === 'string' &&
                typeof correction.issue === 'string' &&
                typeof correction.description === 'string' && 
                typeof correction.suggestion === 'string'
            ))) {
               return { json, debugReport }
            } else {
                throw new InvalidJsonOutputError()
            }
        } catch (error) {
            throw new InvalidJsonOutputError()
        }
    }

//---------------------------------------------------//CLASSIFY TEXT//----------------------------------------------------------------//
    async classifyText(model: Model, text: string, categories: string[], debug = false) {
        const outputFormat = {
          classification: 'classification of the text',
          confidence: 'number representing your confidence of the classification in percentage. display only the number, not the percentage sign',
        };
    
        const { output, debugReport } = await this.llmService.generateOutput(
          model,
          jsonClassification,
          {
            categories,
            text,
            outputFormat: JSON.stringify(outputFormat),
          },
          debug,
        );
    
        try {
          const json: Classification = JSON.parse(output.text);
          if (json.classification && json.confidence) {
            //this.logger.debug('classifyText: json parsed successfully');
            return { json, debugReport };
          } else {
            //this.logger.warn('classifyText: json parsing failed');
            throw new InvalidJsonOutputError();
          }
        } catch (e) {
          //this.logger.warn('classifyText: json parsing failed');
          throw new InvalidJsonOutputError();
        }
      }
    
      async handleGenericPrompt(model: Model, prompt: string, debug = false) {
        const { output, debugReport } = await this.llmService.generateOutput(
          model,
          new PromptTemplate({
            inputVariables: ['prompt'],
            template: '{prompt}',
          }),
          {
            prompt,
          },
          debug,
        );
    
        const json = {
          output: output.text,
        };
        
        //this.logger.debug('handleGenericPrompt: json generated successfully');
        return { json, debugReport };
      }
}