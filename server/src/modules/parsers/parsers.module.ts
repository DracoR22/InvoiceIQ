import { Module } from "@nestjs/common";
import { PdfParserService } from "./pdf-parser/services/pdf-parser.service";
import { PdfParserController } from "./pdf-parser/controllers/pdf-parser.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    controllers: [PdfParserController],
    providers: [PdfParserService]
})
export class ParsersModule {}

