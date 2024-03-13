import { BadRequestException, Body, Controller, HttpCode, ParseFilePipeBuilder, Post, UnprocessableEntityException, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiOkResponse, ApiSecurity, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { PdfParserService } from "../services/pdf-parser.service";
import { PdfParserUploadResultDto, PdfParserUrlResultDto } from "../dtos/pdf-parser-result.dto";
import { PdfParserRequestDto } from "../dtos/pdf-parser-request.dto";
import { PdfNotParsedError } from "../exceptions/exceptions";

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

@ApiUnauthorizedResponse({ description: "The API ket in request's header is missing or invalid" })
@ApiBadRequestResponse({ description: 'The request body or the uploaded file is invalid or missing' })
@ApiUnprocessableEntityResponse({ description: 'The PDF does not contain plain text or information in text format.' })
@ApiSecurity('apiKey')
@ApiTags('parsers')
@Controller({ path: 'parsers/pdf', version: '1' })
export class PdfParserController {
    constructor(
        private readonly pdfParserService: PdfParserService
    ) {}
//-------------------------------------------------------//UPLOAD PDF AND PARSE IT//----------------------------------------------------------//
    @ApiOkResponse({ type: PdfParserUploadResultDto, description: 'The PDF file has been successfully parsed, Its content is returned as text' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: uploadSchema, description: 'PDF file to be parsed' })
    @UseInterceptors(FileInterceptor('file'))
    @Post('upload')
    @HttpCode(200)
    async parsePdfFromUpload(@UploadedFile(pdfPipe) file: Express.Multer.File): Promise<PdfParserUploadResultDto> {
        try {
         const text = await this.pdfParserService.parsePdf(file.buffer)

         return {
            originalFileName: file.originalname,
            content: text
          }
        } catch (error) {
          throw new UnprocessableEntityException(error.message)
        }
    }

//-------------------------------------------------------//POST PDF URL AND PARSE IT//----------------------------------------------------------//
    @ApiOkResponse({ type: PdfParserUploadResultDto, description: 'The PDF file has been successfully parsed, Its content is returned as text' })
    @Post('url')
    @HttpCode(200)
    async parsePdfFromUrl(@Body() dto: PdfParserRequestDto): Promise<PdfParserUrlResultDto> {
        try {
          const file = await this.pdfParserService.loadPdfFromUrl(dto.url)
        
          const text = await this.pdfParserService.parsePdf(file)
      
          return {
            originalUrl: dto.url,
            content: text
          }
        } catch (error) {
          if (error instanceof PdfNotParsedError) {
            throw new UnprocessableEntityException(error.message)
          }

          throw new BadRequestException(error.message)
        }
    }
}

