import { BadRequestException, Body, Controller, HttpCode, InternalServerErrorException, Post, UnprocessableEntityException } from "@nestjs/common";
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiSecurity, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { JsonService } from "../services/json.service";
import { JsonExtractExampleRequestDto, JsonExtractSchemaRequestDto } from "../dtos/json-extract-request.dto";
import { InvalidJsonOutputError } from "../exceptions/exceptions";
import { JsonExtractResultDto } from "../dtos/json-extract-result.dto";
import { Analysis, JsonAnalizeResultDto } from "../dtos/json-analyze-result.dto";
import { JsonAnalizeRequestDto } from "../dtos/json-analyze-request.dto";
import { LLMApiKeyInvalidError, LLMApiKeyMissingError, LLMBadRequestReceivedError } from "../../llm/exceptions/exceptions";

@ApiUnauthorizedResponse({ description: "The API key in request's header is missing or invalid" })
@ApiBadRequestResponse({ description: 'The request body is invalid or missing' })
@ApiUnprocessableEntityResponse({ description: 'The output is not valid json.' })
@ApiSecurity('apiKey')
@ApiTags('organized-data')
@Controller({ path: 'organized-data/json', version: '1' })
export class JsonController {
    constructor(
        private readonly jsonService: JsonService
    ) {}
//----------------------------------------------------------//TURN TEXT INTO JSON//----------------------------------------------------------------//
    @ApiOperation({ summary: 'Return structured data from text as json using a json schema', description: `This endpoint returns organized data from input text as json. It accepts a json schema as model for data extraction. The Refine technique can be used for longer texts.\n Available models: gpt-3.5-turbo, gpt-3.5-turbo-16k, gpt-4`})
    @ApiOkResponse({ type: JsonExtractResultDto, description: 'The text was successfully organized as json. The output is a valid json object.' })
    @ApiBody({ type: JsonExtractSchemaRequestDto, description: 'Request body containing text to process as json and extraction parameters.' })
    @HttpCode(200)
    @Post('schema')
    async extractSchema(@Body() dto: JsonExtractSchemaRequestDto) {
        const { jsonSchema, model, text, debug, refine } = dto

        try {
            if (refine) {
             const { json, refineRecap, debugReport } = await this.jsonService.extractWithSchemaAndRefine(text, model,
             jsonSchema,
                  typeof refine === 'object' ? refine : undefined,
                  debug,
                );
              const response: JsonExtractResultDto = {
                model: model.name,
                refine: refineRecap,
                output: JSON.stringify(json),
                debug: debug ? debugReport : undefined,
              };
             
              return response;
            } else {
              const { json, debugReport } = await this.jsonService.extractWithSchema(
                text,
                model,
                jsonSchema,
                debug,
              );
              const response: JsonExtractResultDto = {
                model: model.name,
                refine: false,
                output: JSON.stringify(json),
                debug: debug ? debugReport : undefined,
              };

              return response;
            }
        } catch (error) {
            if (error instanceof InvalidJsonOutputError || error instanceof LLMBadRequestReceivedError) {
                throw new UnprocessableEntityException(error.message)
            }

            if (error instanceof LLMApiKeyMissingError || error instanceof LLMApiKeyInvalidError) {
                throw new BadRequestException(error.message)
            }

            throw new InternalServerErrorException(error.message)
        }
    }

    @ApiOperation({ summary: 'Return structured data from text as json using an example of input and output', description: `This endpoint returns organized data from input text as json. It accepts a fully featured example with a given input and a desired output json which will be used for data extraction`})
    @ApiOkResponse({ type: JsonExtractResultDto, description: 'The text was successfully organized as json. The output is a valid json object.' })
    @ApiBody({ type: JsonExtractExampleRequestDto, description: 'Request body containing text to process as json and extraction parameters.' })
    @HttpCode(200)
    @Post('example')
    async extractExample(@Body() dto: JsonExtractExampleRequestDto) {
        const { exampleInput, exampleOutput, model, text, debug } = dto

        try {
            const { json, debugReport } = await this.jsonService.extractWithExample(text, model, {
                input: exampleInput,
                output: exampleOutput
            }, debug)
            
            const response: JsonExtractResultDto = { model: model.name, refine: false, output: JSON.stringify(json), debug: debug ? debugReport : undefined }

            return response
        } catch (error) {
            if (error instanceof InvalidJsonOutputError) {
                throw new UnprocessableEntityException(error.message)
            }

            throw new InternalServerErrorException(error.message)
        }
    }

    @ApiOperation({ summary: 'Return analysis of potential errors from generated json output', description: `This endpoint returns an analysis of a generated json output by comparing it to the original text and it json schema. It accepts the json output to analyze the original text and json schema used for data` })
    @ApiOkResponse({ type: JsonAnalizeResultDto, description: 'The analysis is succesfully returned.' })
    @ApiBody({ type: JsonAnalizeRequestDto, description: 'Request body containing the json schema, the original text and the json output analyze' })
    @HttpCode(200)
    @Post('analysis')
    async analizeJsonOutput(@Body() dto: JsonAnalizeRequestDto) {
        const { jsonOutput, jsonSchema, model, originalText, debug } = dto

        try {
            const { json: analysis, debugReport } = await this.jsonService.analizeJsonOutput(model, jsonOutput, originalText, jsonSchema)
            
            const response: JsonAnalizeResultDto = { model: model.name, analysis, debug: debugReport ? debugReport : null }

            return response
        } catch (error) {
            if (error instanceof InvalidJsonOutputError) {
                throw new UnprocessableEntityException(error.message)
            }

            throw new InternalServerErrorException(error.message)
        }
    }
}