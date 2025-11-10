import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CalculatePlagiarismService {
    constructor() {
        this.carpeta = path.join(__dirname, "../../public/books");
        this.articulosCache = null;
        this.umbralSimilitud = 25; // % mínimo para considerar plagio
        this.palabrasComunes = new Set([
            'el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'a', 'con', 'por', 'para',
            'un', 'una', 'unos', 'unas', 'es', 'son', 'se', 'su', 'sus', 'lo', 'al', 'que',
            'como', 'para', 'pero', 'o', 'si', 'no', 'ya', 'este', 'esta', 'estos', 'estas',
            'todo', 'toda', 'todos', 'todas', 'muy', 'mas', 'menos', 'tan', 'tanto', 'cuando',
            'donde', 'como', 'porque', 'antes', 'despues', 'durante', 'hacia', 'desde', 'hasta'
        ]);
    }

    async loadArticles() {
        if (this.articulosCache) {
            return this.articulosCache;
        }

        try {
            const archivos = await fs.readdir(this.carpeta);
            const jsonFiles = archivos.filter(f => f.endsWith(".json"));

            const articulos = await Promise.all(
                jsonFiles.map(async (archivo) => {
                    try {
                        const data = await fs.readFile(path.join(this.carpeta, archivo), "utf8");
                        const articulo = JSON.parse(data);

                        // Pre-procesar el contenido para mejor performance
                        const contenidoLimpio = this.limpiarTexto(articulo.contenido);
                        const palabrasClave = this.extraerPalabrasClave(contenidoLimpio);

                        return {
                            nameFile: archivo,
                            titulo: articulo.titulo,
                            autor: articulo.autor,
                            fecha: articulo.fecha,
                            contenido: articulo.contenido,
                            contenidoLimpio: contenidoLimpio,
                            palabrasClave: palabrasClave
                        };
                    } catch (error) {
                        return error;
                    }
                })
            );

            this.articulosCache = articulos.filter(articulo => articulo !== null);
            return this.articulosCache;

        } catch (error) {
            throw new Error(`Error cargando artículos: ${error.message}`);
        }
    }

    limpiarTexto(texto) {
        if (!texto) return '';

        return texto
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quitar acentos
            .replace(/[^\w\s]/g, ' ') // quitar puntuación
            .replace(/\s+/g, ' ')
            .trim();
    }

    extraerPalabrasClave(textoLimpio) {
        return textoLimpio
            .split(' ')
            .filter(palabra =>
                palabra.length > 3 &&
                !this.palabrasComunes.has(palabra)
            );
    }

    calcularSimilitudPorCoincidencia(palabrasUsuario, palabrasArticulo) {
        if (palabrasUsuario.length === 0) return 0;

        const coincidencias = palabrasUsuario.filter(palabra =>
            palabrasArticulo.includes(palabra)
        ).length;

        return (coincidencias / palabrasUsuario.length) * 100;
    }

    encontrarCoincidenciasExactas(textoUsuario, contenidoArticulo) {
        const palabrasUsuario = textoUsuario.split(' ');
        const fragmentosCoincidentes = [];

        // Buscar secuencias de palabras coincidentes
        for (let i = 0; i < palabrasUsuario.length - 2; i++) {
            const secuencia = palabrasUsuario.slice(i, i + 4).join(' '); // Buscar secuencias de 4 palabras
            if (contenidoArticulo.includes(secuencia)) {
                fragmentosCoincidentes.push(secuencia);
            }
        }

        return fragmentosCoincidentes;
    }

    async calculatePlagiarism(textUser) {
        try {
            if (!textUser || textUser.trim().length === 0) {
                throw new Error('El texto del usuario no puede estar vacío');
            }

            if (textUser.length < 10) {
                throw new Error('El texto debe tener al menos 10 caracteres');
            }

            const articulos = await this.loadArticles();

            if (articulos.length === 0) {
                return {
                    porcentaje: 0,
                    archivo: null,
                    autor: null,
                    titulo: null,
                    fecha: null,
                    esPlagio: false,
                    mensaje: 'No hay artículos disponibles para comparar'
                };
            }

            const textoLimpioUsuario = this.limpiarTexto(textUser);
            const palabrasUsuario = this.extraerPalabrasClave(textoLimpioUsuario);

            let maxSimilitud = 0;
            let articuloMasSimilar = null;
            let coincidenciasExactas = [];

            for (const articulo of articulos) {
                const similitud = this.calcularSimilitudPorCoincidencia(
                    palabrasUsuario,
                    articulo.palabrasClave
                );

                if (similitud > maxSimilitud) {
                    maxSimilitud = similitud;
                    articuloMasSimilar = articulo;

                    // Encontrar coincidencias exactas para el artículo más similar
                    coincidenciasExactas = this.encontrarCoincidenciasExactas(
                        textoLimpioUsuario,
                        articulo.contenidoLimpio
                    );
                }
            }

            const esPlagio = maxSimilitud >= this.umbralSimilitud;

            return {
                porcentaje: maxSimilitud.toFixed(2),
                archivo: articuloMasSimilar?.nameFile || null,
                autor: articuloMasSimilar?.autor || null,
                titulo: articuloMasSimilar?.titulo || null,
                fecha: articuloMasSimilar?.fecha || null,
                esPlagio: esPlagio,
                coincidenciasExactas: coincidenciasExactas.slice(0, 3), // Mostrar hasta 3 coincidencias
                palabrasComparadas: palabrasUsuario.length,
                mensaje: esPlagio ?
                    `Posible plagio detectado (${maxSimilitud.toFixed(2)}% de similitud)` :
                    `Similitud baja: ${maxSimilitud.toFixed(2)}% - Probablemente original`
            };

        } catch (error) { throw error; }
    }

    // Método para limpiar cache si es necesario
    clearCache() {
        this.articulosCache = null;
    }
}

export default new CalculatePlagiarismService();