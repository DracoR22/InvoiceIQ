import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatOpenAI } from "langchain/chat_models/openai"
import { BaseLanguageModel } from "langchain/dist/base_language"
import { ChainValues } from "langchain/dist/schema"
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, loadQARefineChain } from "langchain/chains"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { LLMApiKeyInvalidError, LLMApiKeyMissingError, LLMBadRequestReceivedError, LLMNotAvailableError, PromptTemplateFormatError, RefinePromptInputVaribalesError, RefineReservedChainValuesError } from "../exceptions/exceptions";
import { Document } from "langchain/document"
import { Model } from "../types/types";
import { RefineCallbackHandler } from "../callback-handlers/refine-handler";
import { DebugCallbackHandler } from "../callback-handlers/debug-handler";

@Injectable()
export class LLMService {
    constructor(
        private configService: ConfigService
    ) {}
     async generateOutput(model: Model, promptTemplate: PromptTemplate, chainValues: ChainValues, debug: boolean) {
        const llm = this.retrieveAvailableModel(model)

        try {
         await promptTemplate.format(chainValues)
        } catch (error) {
         throw new PromptTemplateFormatError()
        }

        const llmChain = new LLMChain({ llm, prompt: promptTemplate })

        try {
          const handler = new DebugCallbackHandler()

          const output = await llmChain.call(chainValues, debug ? [handler] : [])
          return { output, debugReport: debug ? handler.debugReport : null }
        } catch (error) {
          if (error?.response?.status && error?.response?.status === 401) {
            throw new LLMApiKeyInvalidError(model.name)
          }

          if (error?.response?.status && error?.response?.status === 400) {
            throw new LLMBadRequestReceivedError(model.name)
          }

          throw error
        }
     }

     async splitDocument(document: string, params: { chunkSize: number; overlap: number }) {
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: params?.chunkSize, chunkOverlap: params?.overlap })

        const output = await splitter.createDocuments([document])

        return output as any
     }

     async generateRefineOutput(model: Model, initialPromptTemplate: PromptTemplate, refinePromptTemplate: PromptTemplate, chainValues: ChainValues & { input_documents: Document[] }, debug: boolean = false) {
        const llm = this.retrieveAvailableModel(model)

        if (chainValues['context' || chainValues['existing_answer']]) {
          throw new RefineReservedChainValuesError('context or existing_answer')
        } 

        this.throwErrorIfInputVariableMissing('initialPromptTemplate', 'context', initialPromptTemplate.inputVariables)
        this.throwErrorIfInputVariableMissing('refinePromptTemplate', 'context', refinePromptTemplate.inputVariables)
        this.throwErrorIfInputVariableMissing('refinePromptTemplate', 'existing_answer', refinePromptTemplate.inputVariables)

        const refineChain = loadQARefineChain(llm, {
            questionPrompt: initialPromptTemplate,
            refinePrompt: refinePromptTemplate
        })

        try {
          const debugHandler = new DebugCallbackHandler()

          const handler = new RefineCallbackHandler()
          const output = await refineChain.call(chainValues, debug ? [handler, debugHandler] : [handler])
          return { output, llmCallCount: handler.llmCallCount , debugReport: debug ? debugHandler.debugReport : null}
        } catch (error) {
          if (error?.response?.status && error?.response?.status === 401) {
            throw new LLMApiKeyInvalidError(model.name)
          }

          if (error?.response?.status && error?.response?.status === 400) {
            throw new LLMBadRequestReceivedError(model.name)
          }

          throw error
        }
     }

     private throwErrorIfInputVariableMissing(templateName: string, variableName: string, inputVariables: string[]) {
      if (!inputVariables.includes(variableName)) {
         throw new RefinePromptInputVaribalesError(templateName, variableName);
       }
     }

     private retrieveAvailableModel(model: Model): BaseLanguageModel {
      switch (model.name) {
        case 'gpt-3.5-turbo':
        case 'gpt-3.5-turbo-16k':
        case 'gpt-4': {
          if (!model.apiKey) {
            throw new LLMApiKeyMissingError(model.name);
          }
          const llm = new ChatOpenAI({
            cache: true,
            maxConcurrency: 10,
            maxRetries: 3,
            modelName: model.name,
            openAIApiKey: model.apiKey,
            temperature: 0,
          });
          return llm;
        }
        default: {
          throw new LLMNotAvailableError(model.name);
        }
       }
     }
}