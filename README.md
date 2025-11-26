# Detector de Plagio

Una aplicación web para detectar posibles plagios en textos, comparándolos con una amplia base de libros digitales. El sistema procesa automáticamente libros en formato PDF, transformándolos a JSON para optimizar la velocidad de búsqueda y realizar comparaciones más eficientes, identificando posibles casos de plagio con precisión y rapidez.

## 🛠 Tecnologías Utilizadas

<div align="center">
<img src="https://skillicons.dev/icons?i=css,nodejs,js,html" height="48" />
</div>

## 🔍 ¿Cómo Funciona?

El usuario ingresa un texto y el programa analiza automáticamente si existe contenido similar en las carpetas que almacena los libros. Cuando se detectan coincidencias, la aplicación muestra:

- 📊 Porcentaje de similitud detectado
- 📚 Título del libro donde se encontró el texto
- ✍️ Autor de la obra

## 🧠 Arquitectura del Sistema

El proyecto incluye una carpeta `books` organizada en:
- **`pdfs`** - Contiene los libros en formato PDF
- **`jsons`** - Archivos generados automáticamente a partir de la conversión de PDFs

## 📥 Formatos de Archios/Libros

### Formatos de nombre de archivo:
Puedes expandir nuestra biblioteca añadiendo libros a la carpeta `books/pdfs`. El nombre de cada archivo debe seguir este formato:

```
nombre-del-libro, nombre-autor.pdf
```

**Ejemplo:**
```
el-libro-de-la-muerte, jesus-perez.pdf
```

### Formato de contenido del archivo:

El contenido del archivo debe ser un texto plano, sin formato de imagen.

**Ejemplo**:  
<div style="text-align: center">

![Descripción de la imagen](/public/img/Ejemplo.png)

</div>

> **Nota:** Los archivos JSON se generan automáticamente, no es necesario crearlos manualmente.

## 🚀 Instalación y Ejecución

Sigue estos simples pasos:

```bash
# Clona el repositorio
git clone https://github.com/RitoTorri/Detector-Plagio

# Accede al directorio
cd Detector-Plagio

# Instala las dependencias
npm install

# Inicia la aplicación
npm start
```