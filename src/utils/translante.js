import PDFParser from "pdf2json";
import fs from "fs";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const Routepdfs = path.join(__dirname, '../../books/pdfs');
const RouteJsons = path.join(__dirname, '../../books/jsons');

// MODIFICAR: Hacer CreateJson retornar una Promise
const CreateJson = (title, route, autor) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataReady", pdfData => {
            let JsonText = { titulo: title, autor: autor, contenido: "" };

            pdfData.Pages.forEach(pagina => {
                pagina.Texts.forEach(texto => {
                    JsonText.contenido += decodeURIComponent(texto.R[0].T) + " ";
                });
                JsonText.contenido += "\n\n";
            });

            fs.writeFile(path.join(RouteJsons, `${title}.json`), JSON.stringify(JsonText, null, 2), function (err) {
                if (err) {
                    console.error(`❌ Error guardando ${title}:`, err);
                    reject(err);
                } else {
                    console.log(`✅ JSON creado: ${title}.json`);
                    resolve();
                }
            });
        });

        pdfParser.on("pdfParser_dataError", err => {
            console.error(`❌ Error procesando ${title}:`, err);
            reject(err);
        });

        pdfParser.loadPDF(route);
    });
}

// MODIFICAR: Exportar la función directamente y usar await
const translante = async () => {
    const PdfsCall = fs.readdirSync(Routepdfs);
    const JsonsCall = fs.readdirSync(RouteJsons);

    // Crear variables para almacenar los nombres de los pdfs y jsons
    const PdfDeleteExtension = [];
    const JsonDeleteExtension = [];

    // Le extraemos las extensiones de los pdfs y jsons
    PdfsCall.forEach(pdf => {
        PdfDeleteExtension.push(pdf.split(".pdf")[0]);
    });
    JsonsCall.forEach(json => {
        JsonDeleteExtension.push(json.split(".json")[0]);
    });

    // Almacenamos los pdfs que no tienen jsons asociados
    const PdfWithoutJson = PdfDeleteExtension.filter(pdf => !JsonDeleteExtension.includes(pdf.split(",")[0]));

    if (PdfWithoutJson.length === 0) return;

    // Le agregamos la extension .pdf a los pdfs que no tienen jsons asociados
    const PdfParseToJson = PdfWithoutJson.map(pdf => `${pdf}.pdf`);

    for (const pdf of PdfParseToJson) {
        // Sacamos extension 
        const libro = pdf.split(".pdf")[0];
        const autor = libro.split(",")[1];
        const titulo = libro.split(",")[0];

        try {
            await CreateJson(titulo, path.join(Routepdfs, pdf), autor);
        } catch (error) {
            console.error(`❌ Falló ${titulo}:`, error);
        }
    }
}

// MODIFICAR: Exportar como default la función
export default translante;