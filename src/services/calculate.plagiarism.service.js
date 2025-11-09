import fs from "fs";
import { getEmbedding, similitudCoseno } from "../utils/functions/embedding.js";
// impor de los paths
import path from 'path';
import { fileURLToPath } from 'url';

// Necesario para usar __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CalculatePlagiarismService {
    constructor() { }

    async calculatePlagiarism(textUser, carpeta = path.join(__dirname, "../../public/books")) {
        try {
            // Leer todos los archivos JSON
            const archivos = fs.readdirSync(carpeta).filter(f => f.endsWith(".json"));

            // Embedding del texto del usuario
            const embUsuario = await getEmbedding(textUser);

            let maxSimilitud = 0;
            let articuloMasSimilar = null;

            // Leer y parsear JSONs
            const articulos = archivos.map(archivo => {
                const data = fs.readFileSync(path.join(carpeta, archivo), "utf8");
                const articulo = JSON.parse(data);

                return {
                    nameFile: archivo,
                    titulo: articulo.titulo,
                    autor: articulo.autor,
                    fecha: articulo.fecha,
                    contenido: articulo.contenido
                };
            });

            // Calcular similitud
            for (const articulo of articulos) {
                const embArticulo = await getEmbedding(articulo.contenido);
                const similitud = similitudCoseno(embUsuario, embArticulo) * 100;

                if (similitud > maxSimilitud) {
                    maxSimilitud = similitud;
                    articuloMasSimilar = articulo; // guardamos todo el objeto
                }
            }

            // Retornar solo el artículo más similar con porcentaje y metadatos
            return {
                porcentaje: maxSimilitud.toFixed(2),
                archivo: articuloMasSimilar?.nameFile || null,
                autor: articuloMasSimilar?.autor || null,
                titulo: articuloMasSimilar?.titulo || null,
                fecha: articuloMasSimilar?.fecha || null
            };

        } catch (error) { throw error; }
    }
}

export default new CalculatePlagiarismService();
