import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { IsUrl } from "class-validator";

class UploadResultDto {
    @ApiProperty()
    originalFileName: string
}

export class PdfParserResultDto {
    @ApiProperty()
    content: string
}

class UrlResultDto {
    @ApiProperty()
    @IsUrl()
    originalUrl: string
}

export class PdfParserUploadResultDto extends IntersectionType(PdfParserResultDto, UploadResultDto) {}

export class PdfParserUrlResultDto extends IntersectionType(PdfParserResultDto, UrlResultDto) {}

