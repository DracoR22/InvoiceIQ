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
        const response = await this.httpService.axiosRef({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        })

        if (!response.headers['content-type'].includes('application/pdf')) {
            throw new UnprocessableEntityException('The URL does not point to a PDF file')
        }

        if (parseInt(response.headers['Content-Length'] as string, 10) > 1024 * 1024 * 5) {
            throw new UnprocessableEntityException('The PDF file is larger than 5MB')
        }

        return Buffer.from(response.data, 'binary')
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

