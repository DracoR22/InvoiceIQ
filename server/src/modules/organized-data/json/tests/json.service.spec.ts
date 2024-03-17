import { ConfigModule, ConfigService } from "@nestjs/config";
import { LLMService } from "../../llm/services/llm.service";
import { JsonService } from "../services/json.service";
import { Test, TestingModule } from "@nestjs/testing";
import { InvalidJsonOutputError } from "../exceptions/exceptions";

describe('JsonService', () => {
    let service: JsonService;
    let llmService: LLMService;
    let configService: ConfigService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [ConfigModule.forRoot()],
        providers: [
          JsonService,
          LLMService
        ],
      }).compile();
  
      service = module.get<JsonService>(JsonService);
      llmService = module.get<LLMService>(LLMService);
      configService = module.get<ConfigService>(ConfigService);
    });
  
    it('should be defined', () => {
      expect(service).toBeDefined();
    })

    describe('extractWithSchema()', () => {
        it('should return a json object', async () => {
          const text = 'This is a text';
          
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }

          const schema = '{"title": "string", "description": "string"}';

          const { json } = await service.extractWithSchema(text, model, schema);
          expect(json).toBeDefined();
          expect(json).toHaveProperty('title');
          expect(json).toHaveProperty('description');
        });
    
        it('should throw an error if the output is not a valid json', async () => {
          const text = 'This is a text';
          
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }

          const schema = '{"title": "string", "description": "string"}';

          jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
            output: { text: '{"title": "string", "description": "string"' },
            debugReport: null,
          });

          await expect(service.extractWithSchema(text, model, schema)).rejects.toThrow(InvalidJsonOutputError);
        });
      });    

      describe('extractWithExample()', () => {
        it('should return a json object', async () => {
          const text = 'This is a text';
          
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }

          const example = {
            input: 'This is a text',
            output: '{"title": "string", "description": "string"}',
          };
          const { json } = await service.extractWithExample(text, model, example);
          expect(json).toBeDefined();
          expect(json).toHaveProperty('title');
          expect(json).toHaveProperty('description');
        });
    
        it('should throw an error if the output is not a valid json', async () => {
          const text = 'This is a text';
          
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }

          const example = {
            input: 'This is a text',
            output: '{"title": "string", "description": "string"}',
          };

          jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
            output: { text: '{"title": "string", "description": "string"' },
            debugReport: null,
          });

          await expect(service.extractWithExample(text, model, example)).rejects.toThrow(InvalidJsonOutputError);
        });
      });

      describe('analyzeJsonOutput()', () => {
        it('should return an Analysis object', async () => {
          const originalText = 'This is a text';
          const jsonOutput = {
            title: 'This is a title',
            description: 'This is a text',
          };
          const schema = '{"title": "string", "description": "string"}';
          
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }

          const { json: analysis } = await service.analizeJsonOutput(
            model,
            JSON.stringify(jsonOutput),
            originalText,
            schema,
          );
    
          expect(analysis).toBeDefined();
          expect(analysis).toHaveProperty('corrections');
          expect(analysis).toHaveProperty('textAnalysis');
        }, 20000);
    
        it('should throw if the output is not a valid Analysis object', async () => {
          const originalText = 'This is a text';
          const jsonOutput = {
            title: 'This is a title',
            description: 'This is a text',
          };
          const schema = '{"title": "string", "description": "string"}';
          
          const model = {
            apiKey: configService.get('OPENAI_API_KEY'),
            name: 'gpt-3.5-turbo'
          }
          
          jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
            output: { text: '{}{analysis}' },
            debugReport: null,
          });
    
          await expect(
            service.analizeJsonOutput(
              model,
              JSON.stringify(jsonOutput),
              originalText,
              schema,
            ),
          ).rejects.toThrow(InvalidJsonOutputError);
        });
      });
})