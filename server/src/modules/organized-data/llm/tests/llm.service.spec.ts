import { Test, TestingModule } from "@nestjs/testing"
import { LLMService } from "../services/llm.service"
import { PromptTemplate } from "langchain/prompts"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { LLMApiKeyInvalidError, LLMApiKeyMissingError, LLMNotAvailableError, PromptTemplateFormatError } from "../exceptions/exceptions"

describe('LlmService', () => {
    let service: LLMService
    let configService: ConfigService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            providers: [LLMService]
        }).compile()

        service = module.get<LLMService>(LLMService)
        configService = module.get<ConfigService>(ConfigService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('generateOutput()', () => {
        it('should generate an output', async () => {
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }

          const promptTemplate = new PromptTemplate({
            template: 'What is a good name for a company that makes {product}?',
            inputVariables: ['product'],
          });

          const { output, debugReport } = await service.generateOutput(model, promptTemplate, { product: 'cars' }, true);
    
          expect(output).toBeDefined();
          expect(debugReport).toBeDefined()
        });

        it('should generate an output with debug report', async () => {
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }

          const promptTemplate = new PromptTemplate({
            template: 'What is a good name for a company that makes {product}?',
            inputVariables: ['product'],
          });

          const { output, debugReport } = await service.generateOutput(model, promptTemplate, { product: 'cars' }, true);
    
          expect(output).toBeDefined();
          expect(debugReport).toBeDefined()
          expect(debugReport).toHaveProperty('chainCallCount')
          expect(debugReport).toHaveProperty('llmCallCount')
          expect(debugReport).toHaveProperty('chains')
          expect(debugReport).toHaveProperty('llms')
        }, 20000);

        it('should throw error if the model given is not available', async () => {
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-42'
          }

            const promptTemplate = new PromptTemplate({
                template: 'What is a good name for a company that makes {product}?',
                inputVariables: ['product'],  
            });

            await expect(service.generateOutput(model, promptTemplate, { product: 'cars' }, true)).rejects.toThrow(LLMNotAvailableError)
        })

        it('should throw error if the given model needs a missing API key', async () => {
          const model = {
            name: 'gpt-3.5-turbo'
          }

            const promptTemplate = new PromptTemplate({
                template: 'What is a good name for a company that makes {product}?',
                inputVariables: ['product'],  
            });

            await expect(service.generateOutput(model, promptTemplate, { product: 'cars' }, true)).rejects.toThrow(LLMApiKeyMissingError)
        })

        it('should throw error if the given model API key is invalid', async () => {
          const model = {
            apiKey: 'invalid',
            name: 'gpt-3.5-turbo'
          }

            const promptTemplate = new PromptTemplate({
                template: 'What is a good name for a company that makes {product}?',
                inputVariables: ['product'],  
            });

            await expect(service.generateOutput(model, promptTemplate, { product: 'cars' }, true)).rejects.toThrow(LLMApiKeyInvalidError)
        })

        it('should throw error if the chain values do not match the input variables of the prompt template', async () => {
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }
  
            const promptTemplate = new PromptTemplate({
              template: 'What is a good name for a company that makes {product}?',
              inputVariables: ['product'],
            });
  
            const output = await service.generateOutput(model, promptTemplate, { wrongValue: 'cars' }, true);
      
            expect(output).rejects.toThrow(PromptTemplateFormatError);
          });
    });

    describe('generateRefineOutput()', () => {
        it ('should generate the correct output from a chunked document', async () => {
           const model = {
              apiKey: configService.get('OPENAI_API_KEY'),
              name: 'gpt-3.5-turbo'
            }

            const text = `This is the first sentence of the testing text.\n This is the second sentence of the testing text. It contains the tagged value to output: llm-organizer`

              const documents = await service.splitDocument(text, { chunkSize: 100, overlap: 0 });

              const initialPromptTemplate = new PromptTemplate({
                template: `Given the following text, please write the value to output.
                -----------------
                {context}
                -----------------
                Output:`,
                inputVariables: ['context'],
              });

              const refinePromptTemplate = new PromptTemplate({
                template: `
                Given the following text, please only write the tagged value to output.
                -----------------
                You have provided an existing output:
                {existing_answer}
                
                We have the opportunity to refine the original output to give a better answer.
                If the context isn't useful, return the existing output.`,
                inputVariables: ['existing_answer', 'context'],
              });

              const { output, llmCallCount, debugReport } = await service.generateRefineOutput(model, initialPromptTemplate, refinePromptTemplate, {
                input_documents: documents
              }, false)

              expect(output).toBeDefined()
              expect(output['output_text']).toContain('llm-organizer')
              expect(llmCallCount).toBe(2)
              expect(debugReport).toBeNull()
        }, 70000)   
        
        it ('should generate the correct output from a chunked document with debug report', async () => {
          const model = {
             apiKey: configService.get('OPENAI_API_KEY'),
             name: 'gpt-3.5-turbo'
           }

           const text = `This is the first sentence of the testing text.\n This is the second sentence of the testing text. It contains the tagged value to output: llm-organizer`

             const documents = await service.splitDocument(text, { chunkSize: 100, overlap: 0 });

             const initialPromptTemplate = new PromptTemplate({
               template: `Given the following text, please write the value to output.
               -----------------
               {context}
               -----------------
               Output:`,
               inputVariables: ['context'],
             });

             const refinePromptTemplate = new PromptTemplate({
               template: `
               Given the following text, please only write the tagged value to output.
               -----------------
               You have provided an existing output:
               {existing_answer}
               
               We have the opportunity to refine the original output to give a better answer.
               If the context isn't useful, return the existing output.`,
               inputVariables: ['existing_answer', 'context'],
             });

             const { output, llmCallCount, debugReport } = await service.generateRefineOutput(model, initialPromptTemplate, refinePromptTemplate, {
               input_documents: documents
             }, true)

             expect(output).toBeDefined()
             expect(output['output_text']).toContain('llm-organizer')
             expect(llmCallCount).toBe(2)
             expect(debugReport).toBeDefined()
             expect(debugReport).toHaveProperty('chainCallCount')
             expect(debugReport).toHaveProperty('llmCallCount')
             expect(debugReport).toHaveProperty('chains')
             expect(debugReport).toHaveProperty('llms')
       }, 70000)    
    })
})