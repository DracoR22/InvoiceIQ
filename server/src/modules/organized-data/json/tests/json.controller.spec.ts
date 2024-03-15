import { ConfigModule, ConfigService } from "@nestjs/config";
import { JsonController } from "../controllers/json.controller";
import { JsonService } from "../services/json.service";
import { Test, TestingModule } from "@nestjs/testing";
import { LLMService } from "../../llm/services/llm.service";

describe('JsonController', () => {
    let controller: JsonController;
    let service: JsonService;
    let configService: ConfigService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JsonService,
          LLMService,
        ],
        controllers: [JsonController],
        imports: [ConfigModule.forRoot()],
      }).compile();
  
      controller = module.get<JsonController>(JsonController);
      service = module.get<JsonService>(JsonService);
      configService = module.get<ConfigService>(ConfigService);
    });
  
    it('should be defined', () => {
      expect(controller).toBeDefined();
    })

    it('should return a JsonExtractResultDto from a correct data organizing request', async () => {
        const text = 'This is a text';
        const model = 'gpt-3.5-turbo'

        const schema = '{"title": "string", "description": "string"}';

        const json = await controller.extractSchema({
          text,
          model,
          jsonSchema: schema,
        });
    
        expect(json).toBeDefined();
        expect(json).toMatchObject({
          model: expect.any(String),
          refine: expect.any(Boolean),
          output: expect.any(String),
        });
        expect(() => JSON.parse(json.output)).not.toThrow();
      });

      it("should call extractWithSchemaAndRefine() if the 'refine' paramter is set to true", async () => {
        const text = 'This is a text';
        const model = 'gpt-3.5-turbo'
        const schema = '{"title": "string", "description": "string"}';
        const spy = jest.spyOn(service, 'extractWithSchemaAndRefine');
        await controller.extractSchema({
          text,
          model,
          jsonSchema: schema,
          refine: true,
        });
    
        expect(spy).toHaveBeenCalled();
      });
})