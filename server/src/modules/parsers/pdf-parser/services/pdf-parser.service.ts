import { HttpService } from "@nestjs/axios";
import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Poppler from "node-poppler";

@Injectable()
export class PdfParserService {
    constructor(
        private configService: ConfigService,
        private httpService: HttpService
    ) {}
//--------------------------------------------------------//PARSE PDF SERVICE//----------------------------------------------------------------//
    async parsePdf(file: Buffer) {
        const poppler = new Poppler()

        let text = await poppler.pdfToText(file, null, {
            maintainLayout: true,
            quiet: true
        })

        if (typeof text === 'string') {
            text = this.postProcessText(text)
        }

        return text
    }

//--------------------------------------------------------//POST PDF FROM URL//----------------------------------------------------------------//
    async loadPdfFromUrl(url: string) {
        
    }

//---------------------------------------------------------//PRIVATE FUNCTIONS//----------------------------------------------------------------//
    private postProcessText(text: string) {
        const processedText = text
        .split('\n')
        //trim each line
        .map((line) => line.trim())
        //keep only one line if multiple lines are empty
        .filter((line, index, arr) => line !== '' || arr[index - 1] !== '')
        //remove whitespace in lines if there are more than 3 spaces
        .map((line) => line.replace(/\s{3,}/g, '   '))
        .join('\n');

        return processedText;
    }

}

