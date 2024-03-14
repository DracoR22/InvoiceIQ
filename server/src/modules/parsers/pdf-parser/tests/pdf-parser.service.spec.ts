import { Test, TestingModule } from "@nestjs/testing"
import { PdfParserService } from "../services/pdf-parser.service"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { HttpModule } from "@nestjs/axios"
import { PdfExtensionError, PdfMagicNumberError } from "../exceptions/exceptions"

describe('PdfParserService', () => {
    let service: PdfParserService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PdfParserService, ConfigService],
            imports: [HttpModule, ConfigModule.forRoot()]
        }).compile()

        service = module.get<PdfParserService>(PdfParserService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })

    describe('postProcessText', () => {
        it('should trim the lines and remove excess inner whitespace to keep a maximum of 3', () => {
            const input = '       a            b                  c d         ';
            const expected = 'a   b   c d';
            const actual = service['postProcessText'](input)
            expect(actual).toBe(expected)
        })

        it('should keep only one empty line if multiple lines are empty', () => {
            const input = 'a\n\n\nb\n\n\n\nc\nd';
            const expected = 'a\n\nb\n\nc\nd';
            const actual = service['postProcessText'](input);
            expect(actual).toEqual(expected);
        })
    })

    describe('loadPdfFromUrl()', () => {
        it('should load the pdf from the url and parse it', async () => {
            const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
            const buffer = await service.loadPdfFromUrl(url)
            expect(buffer).toBeDefined()

            const expected = 'Dummy PDF file'
            const actual = await service.parsePdf(buffer)

            expect(actual).toBe(expected)
        }, 70000)
    })
})

