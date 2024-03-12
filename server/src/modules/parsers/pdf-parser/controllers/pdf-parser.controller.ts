import { Body, Controller, ParseFilePipeBuilder, Post, UnprocessableEntityException, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { PdfParserService } from "../services/pdf-parser.service";
import { PdfParserUploadResultDto, PdfParserUrlResultDto } from "../dtos/pdf-parser-result.dto";
import { PdfParserRequestDto } from "../dtos/pdf-parser-request.dto";

const uploadSchema = {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
 };

const pdfPipe = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: 'pdf',
  })
  .addMaxSizeValidator({
    maxSize: 1024 * 1024 * 5, // 5 MB
  })
  .build({
    fileIsRequired: true,
  });

@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path: 'parsers/pdf', version: '1' })
export class PdfParserController {
    constructor(
        private readonly pdfParserService: PdfParserService
    ) {}
//-------------------------------------------------------//UPLOAD PDF AND PARSE IT//----------------------------------------------------------//
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: uploadSchema, description: 'PDF file to be parsed' })
    @UseInterceptors(FileInterceptor('file'))
    @Post('upload')
    async parsePdfFromUpload(@UploadedFile(pdfPipe) file: Express.Multer.File): Promise<PdfParserUploadResultDto> {
        const text = await this.pdfParserService.parsePdf(file.buffer)

        if (typeof text !== 'string' || text.length === 0) {
            throw new UnprocessableEntityException('The PDF file could not be parsed')
        }

        return {
            originalFileName: file.originalname,
            content: text
        }
    }

//-------------------------------------------------------//POST PDF URL AND PARSE IT//----------------------------------------------------------//
    @Post('url')
    async parsePdfFromUrl(@Body() dto: PdfParserRequestDto): Promise<PdfParserUrlResultDto> {
        const file = await this.pdfParserService.loadPdfFromUrl(dto.url)
        
        const text = await this.pdfParserService.parsePdf(file)

        if (typeof text !== 'string' || text.length === 0) {
            throw new UnprocessableEntityException('The PDF file could not be parsed')
        }

        return {
            originalUrl: dto.url,
            content: text
        }
    }
}

