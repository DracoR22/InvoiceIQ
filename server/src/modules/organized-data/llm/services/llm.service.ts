import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "langchain/chat_models/openai"
import { BaseLanguageModel } from "langchain/dist/base_language"
import { ChainValues } from "langchain/dist/schema"
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, loadQARefineChain } from "langchain/chains"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { LLMNotAvailableError, PromptTemplateFormatError, RefinePromptInputVaribalesError, RefineReservedChainValuesError } from "../exceptions/exceptions";
import { Document } from "langchain/document"

@Injectable()
export class LLMService {
    constructor(
        private configService: ConfigService
    ) {}
    private gpt3_5 = new ChatOpenAI({
       cache: true,
       maxConcurrency: 10,
       maxRetries: 3,
       modelName: 'gpt-3.5-turbo',
       openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
       temperature: 0
    })

    private gpt4 = new ChatOpenAI({
        cache: true,
        maxConcurrency: 10,
        maxRetries: 3,
        modelName: 'gpt-4',
        openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
        temperature: 0
     })

     private availablemodels = new Map<string, BaseLanguageModel>([
        ['gpt-3.5-turbo', this.gpt3_5],
        ['gpt-4', this.gpt4]
     ])

     async generateOutput(model: string, promptTemplate: PromptTemplate, chainValues: ChainValues) {
        if (!this.availablemodels.has(model)) {
         throw new LLMNotAvailableError(model)
        }

        try {
         await promptTemplate.format(chainValues)
        } catch (error) {
         throw new PromptTemplateFormatError()
        }

        const llmChain = new LLMChain({ llm: this.availablemodels.get(model), prompt: promptTemplate })

        const output = await llmChain.call(chainValues)

        return output
     }

     async splitDocument(document: string, params: { chunkSize: number; overlap: number }) {
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: params?.chunkSize, chunkOverlap: params?.overlap })

        const output = await splitter.createDocuments([document])

        return output as any
     }

     async generateRefineOutput(model: string, initialPromptTemplate: PromptTemplate, refinePromptTemplate: PromptTemplate, chainValues: ChainValues & { input_documents: Document[] }) {
        if (!this.availablemodels.has(model)) {
         throw new LLMNotAvailableError(model)
        }

        if (chainValues['context' || chainValues['existing_answer']]) {
          throw new RefineReservedChainValuesError('context or existing_answer')
        } 

        this.throwErrorIfInputVariableMissing('initialPromptTemplate', 'context', initialPromptTemplate.inputVariables)
        this.throwErrorIfInputVariableMissing('refinePromptTemplate', 'context', refinePromptTemplate.inputVariables)
        this.throwErrorIfInputVariableMissing('refinePromptTemplate', 'existing_answer', refinePromptTemplate.inputVariables)

        const refineChain = loadQARefineChain(this.availablemodels.get(model), {
            questionPrompt: initialPromptTemplate,
            refinePrompt: refinePromptTemplate
        })

        const output = await refineChain.call(chainValues)

        return output
     }

     private throwErrorIfInputVariableMissing(templateName: string, variableName: string, inputVariables: string[]) {
      if (!inputVariables.includes(variableName)) {
         throw new RefinePromptInputVaribalesError(templateName, variableName);
       }
     }
}