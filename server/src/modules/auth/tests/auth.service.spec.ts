import { ApiKey } from "../../../db/entities/api-key.entity";
import { AuthService } from "../services/auth.service"
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";

describe('AuthService', () => {
   let authService: AuthService

   const mockApiKeyRepository = {
      findOneBy: jest.mock
   }

   const mockApiKey = { id: 'b2edb9e5-8999-4aca-af65-6deacfd1bb9a' } as ApiKey;

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            AuthService, {
                provide: getRepositoryToken(ApiKey),
                useValue: mockApiKeyRepository
            }
         ]
      }).compile()

      authService = module.get<AuthService>(AuthService)
   })

   it('should be defined', () => {
      expect(authService).toBeDefined()
   })

   describe('validateApiKey()', () => {
      it('should return false if the api key is in invalid format', async () => {
         mockApiKeyRepository.findOneBy = jest.fn().mockResolvedValue(null)

         const apikey = 'invalid-api-key'
         const result = await authService.validateApiKey(apikey)
         expect(mockApiKeyRepository.findOneBy).not.toHaveBeenCalled()
         expect(result).toBe(false)
      })

      it('shoud return false if the api key does not exists', async () => {
        mockApiKeyRepository.findOneBy = jest.fn().mockResolvedValue(null)

        const apiKey = 'b2edb9e5-8999-4aca-af65-6deacfd1bb9a'
        const result = await authService.validateApiKey(apiKey)

        expect(mockApiKeyRepository.findOneBy).toHaveBeenCalledWith({ id: apiKey })
        expect(result).toBe(false)
      })

      it('shoud return true if the api key exists', async () => {
        mockApiKeyRepository.findOneBy = jest.fn().mockResolvedValue(mockApiKey)

        const result = await authService.validateApiKey(mockApiKey.id)

        expect(mockApiKeyRepository.findOneBy).toHaveBeenCalledWith({ id: mockApiKey.id })
        expect(result).toBe(true)
      })
   })
})

