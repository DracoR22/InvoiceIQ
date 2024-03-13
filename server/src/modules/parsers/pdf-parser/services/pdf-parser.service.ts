import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Poppler from "node-poppler";
import { AxiosResponse } from "axios";
import { PdfExtensionError, PdfMagicNumberError, PdfNotParsedError, PdfSizeError } from "../exceptions/exceptions";

@Injectable()
export class PdfParserService {
    constructor(
        private configService: ConfigService,
        private httpService: HttpService
    ) {}
//--------------------------------------------------------//PARSE PDF SERVICE//----------------------------------------------------------------//
    async parsePdf(file: Buffer) {
        const poppler = new Poppler()

        const output = await poppler.pdfToText(file, null, {
            maintainLayout: true,
            quiet: true
        }) as any

        if (output instanceof Error || output.length === 0) {
            throw new PdfNotParsedError()
        }

        return this.postProcessText(output)
    }

//--------------------------------------------------------//POST PDF FROM URL//----------------------------------------------------------------//
    async loadPdfFromUrl(url: string) {
        const extension = url.split('.').pop()

        if (extension !== 'pdf') {
            throw new PdfExtensionError()
        }

        const response = await this.httpService.axiosRef({
            url,
            method: 'GET',
            responseType: 'arraybuffer'
        })

        this.checkResponse(response)

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

    private checkResponse(response: AxiosResponse) {
        if (parseInt(response.headers['Content-Length'] as string, 10) > 1024 * 1024 * 5) {
            throw new PdfSizeError()
        }

        const pdfMagicNumber = Buffer.from([0x25, 0x50, 0x44, 0x46])
        const bufferStart = response.data.subarray(0, 4)

        if (!bufferStart.equals(pdfMagicNumber)) {
            throw new PdfMagicNumberError()
        }
    }
}

