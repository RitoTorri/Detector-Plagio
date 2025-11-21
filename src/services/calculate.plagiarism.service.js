import fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CalculatePlagiarismService {
    constructor() {
        this.carpeta = path.join(__dirname, "../../books/jsons");
        this.articulosCache = null;
        this.umbralSimilitud = 60; // Aumentado para plagio real
        this.umbralAdvertencia = 30; // Para similitud moderada

        this.palabrasComunes = new Set([
            'el', 'la', 'los', 'las', 'de', 'del', 'en', 'y', 'a', 'con', 'por', 'para',
            'un', 'una', 'unos', 'unas', 'es', 'son', 'se', 'su', 'sus', 'lo', 'al', 'que',
            'como', 'para', 'pero', 'o', 'si', 'no', 'ya', 'este', 'esta', 'estos', 'estas',
            'todo', 'toda', 'todos', 'todas', 'muy', 'mas', 'menos', 'tan', 'tanto', 'cuando',
            'donde', 'como', 'porque', 'antes', 'despues', 'durante', 'hacia', 'desde', 'hasta',
            'ser', 'estar', 'haber', 'tener', 'hacer', 'poder', 'decir', 'ver', 'saber', 'querer'
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

                        const contenidoLimpio = this.limpiarTexto(articulo.contenido);

                        return {
                            nameFile: archivo,
                            titulo: articulo.titulo,
                            autor: articulo.autor,
                            fecha: articulo.fecha,
                            contenido: articulo.contenido,
                            contenidoLimpio: contenidoLimpio,
                            // Pre-calcular para mejor performance
                            palabrasUnicas: new Set(this.extraerPalabrasClave(contenidoLimpio)),
                            ngramas: this.generarTodosNgramas(contenidoLimpio)
                        };
                    } catch (error) {
                        console.error(`Error cargando ${archivo}:`, error);
                        return null;
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
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, ' ')
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

    generarTodosNgramas(texto) {
        const palabras = texto.split(' ');
        const todosNgramas = {
            bigramas: new Set(),
            trigramas: new Set(),
            tetragramas: new Set()
        };

        // Bigramas (2 palabras)
        for (let i = 0; i <= palabras.length - 2; i++) {
            const bigrama = palabras.slice(i, i + 2).join(' ');
            todosNgramas.bigramas.add(bigrama);
        }

        // Trigramas (3 palabras)
        for (let i = 0; i <= palabras.length - 3; i++) {
            const trigrama = palabras.slice(i, i + 3).join(' ');
            todosNgramas.trigramas.add(trigrama);
        }

        // Tetragramas (4 palabras)
        for (let i = 0; i <= palabras.length - 4; i++) {
            const tetragrama = palabras.slice(i, i + 4).join(' ');
            todosNgramas.tetragramas.add(tetragrama);
        }

        return todosNgramas;
    }

    calcularSimilitudCompleta(textoUsuario, articulo) {
        const palabrasUsuario = this.extraerPalabrasClave(textoUsuario);
        const ngramasUsuario = this.generarTodosNgramas(textoUsuario);

        if (palabrasUsuario.length === 0) return 0;

        // 1. Similitud por palabras únicas (20%)
        const coincidenciasPalabras = palabrasUsuario.filter(palabra =>
            articulo.palabrasUnicas.has(palabra)
        ).length;
        const similitudPalabras = (coincidenciasPalabras / palabrasUsuario.length) * 100;

        // 2. Similitud por bigramas (25%)
        let coincidenciasBigramas = 0;
        ngramasUsuario.bigramas.forEach(bigrama => {
            if (articulo.ngramas.bigramas.has(bigrama)) coincidenciasBigramas++;
        });
        const similitudBigramas = ngramasUsuario.bigramas.size > 0 ?
            (coincidenciasBigramas / ngramasUsuario.bigramas.size) * 100 : 0;

        // 3. Similitud por trigramas (30%)
        let coincidenciasTrigramas = 0;
        ngramasUsuario.trigramas.forEach(trigrama => {
            if (articulo.ngramas.trigramas.has(trigrama)) coincidenciasTrigramas++;
        });
        const similitudTrigramas = ngramasUsuario.trigramas.size > 0 ?
            (coincidenciasTrigramas / ngramasUsuario.trigramas.size) * 100 : 0;

        // 4. Similitud por tetragramas (25%)
        let coincidenciasTetragramas = 0;
        ngramasUsuario.tetragramas.forEach(tetragrama => {
            if (articulo.ngramas.tetragramas.has(tetragrama)) coincidenciasTetragramas++;
        });
        const similitudTetragramas = ngramasUsuario.tetragramas.size > 0 ?
            (coincidenciasTetragramas / ngramasUsuario.tetragramas.size) * 100 : 0;

        // Combinar con pesos
        return (similitudPalabras * 0.2) +
            (similitudBigramas * 0.25) +
            (similitudTrigramas * 0.3) +
            (similitudTetragramas * 0.25);
    }

    encontrarCoincidenciasSustanciales(textoUsuario, contenidoArticulo) {
        const palabrasUsuario = textoUsuario.split(' ');
        const fragmentosCoincidentes = [];

        // Buscar secuencias largas (mínimo 8 palabras)
        for (let i = 0; i < palabrasUsuario.length - 7; i++) {
            for (let longitud = 8; longitud <= 15; longitud++) {
                if (i + longitud > palabrasUsuario.length) break;

                const secuencia = palabrasUsuario.slice(i, i + longitud).join(' ');
                if (contenidoArticulo.includes(secuencia)) {
                    fragmentosCoincidentes.push({
                        texto: secuencia,
                        longitud: longitud,
                        posicion: i
                    });
                    i += longitud - 1; // Saltar la secuencia encontrada
                    break;
                }
            }
        }

        return fragmentosCoincidentes;
    }

    calcularPorcentajeTextoCoincidente(textoUsuario, contenidoArticulo, coincidencias) {
        if (coincidencias.length === 0) return 0;

        const totalPalabrasUsuario = textoUsuario.split(' ').length;
        let palabrasCoincidentes = 0;

        coincidencias.forEach(coincidencia => {
            palabrasCoincidentes += coincidencia.longitud;
        });

        return (palabrasCoincidentes / totalPalabrasUsuario) * 100;
    }

    async calculatePlagiarism(textUser) {
        try {
            if (!textUser || textUser.trim().length === 0) {
                throw new Error('El texto del usuario no puede estar vacío');
            }

            if (textUser.length < 50) {
                throw new Error('El texto debe tener al menos 50 caracteres');
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

            let maxSimilitud = 0;
            let articuloMasSimilar = null;
            let coincidenciasSustanciales = [];
            let porcentajeCoincidente = 0;

            for (const articulo of articulos) {
                const similitud = this.calcularSimilitudCompleta(textoLimpioUsuario, articulo);

                if (similitud > maxSimilitud) {
                    maxSimilitud = similitud;
                    articuloMasSimilar = articulo;

                    // Buscar coincidencias sustanciales
                    coincidenciasSustanciales = this.encontrarCoincidenciasSustanciales(
                        textoLimpioUsuario,
                        articulo.contenidoLimpio
                    );

                    // Calcular porcentaje de texto que coincide
                    porcentajeCoincidente = this.calcularPorcentajeTextoCoincidente(
                        textoLimpioUsuario,
                        articulo.contenidoLimpio,
                        coincidenciasSustanciales
                    );
                }
            }

            // Decisión más inteligente sobre plagio
            let esPlagio = false;
            let nivel = 'bajo';

            if (porcentajeCoincidente > 20 || maxSimilitud > 80) {
                esPlagio = true;
                nivel = 'critico';
            } else if (porcentajeCoincidente > 10 || maxSimilitud > 60) {
                esPlagio = true;
                nivel = 'alto';
            } else if (maxSimilitud > 40) {
                esPlagio = true;
                nivel = 'medio';
            } else if (maxSimilitud > 25) {
                esPlagio = false;
                nivel = 'bajo';
                maxSimilitud = Math.min(maxSimilitud, 25); // Limitar similitud baja
            }

            // Si hay coincidencias sustanciales, aumentar la similitud
            if (coincidenciasSustanciales.length > 0) {
                const bonusCoincidencias = Math.min(porcentajeCoincidente * 2, 30);
                maxSimilitud = Math.min(maxSimilitud + bonusCoincidencias, 100);
            }

            return {
                porcentaje: Math.min(maxSimilitud, 100).toFixed(2),
                archivo: articuloMasSimilar?.nameFile || null,
                autor: articuloMasSimilar?.autor || null,
                titulo: articuloMasSimilar?.titulo || null,
                fecha: articuloMasSimilar?.fecha || null,
                esPlagio: esPlagio,
                nivel: nivel,
                coincidenciasSustanciales: coincidenciasSustanciales.slice(0, 5),
                porcentajeCoincidente: porcentajeCoincidente.toFixed(2),
                totalCoincidencias: coincidenciasSustanciales.length,
                palabrasComparadas: textoLimpioUsuario.split(' ').length,
                mensaje: this.generarMensaje(esPlagio, nivel, maxSimilitud, porcentajeCoincidente)
            };

        } catch (error) {
            throw error;
        }
    }

    generarMensaje(esPlagio, nivel, similitud, porcentajeCoincidente) {
        if (esPlagio) {
            if (nivel === 'critico') {
                return `🚨 PLAGIO DETECTADO (${similitud.toFixed(2)}% similitud, ${porcentajeCoincidente}% texto coincidente)`;
            } else if (nivel === 'alto') {
                return `⚠️ ALTO NIVEL DE PLAGIO (${similitud.toFixed(2)}% similitud)`;
            } else {
                return `⚠️ Posible plagio (${similitud.toFixed(2)}% similitud)`;
            }
        } else {
            if (similitud > 15) {
                return `ℹ️ Similitud moderada (${similitud.toFixed(2)}%) - Revisar fuentes`;
            } else {
                return `✅ Texto probablemente original (${similitud.toFixed(2)}% similitud)`;
            }
        }
    }

    clearCache() {
        this.articulosCache = null;
    }
}

export default new CalculatePlagiarismService();