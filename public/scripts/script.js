const SendText = () => {
    const text = document.getElementById("Texto");
    const boton = document.getElementById("Boton");
    const error = document.getElementById("Error");

    const resultado = document.getElementById("Resultado");
    const porcentajeExacto = document.getElementById("PorcentajeExacto");
    const autor = document.getElementById("Autor");
    const titulo = document.getElementById("Titulo");
    const fecha = document.getElementById("Fecha");
    const nivelSimilitud = document.getElementById("NivelSimilitud");

    const progressBar = document.getElementById("ProgressBar");
    const progressPercentage = document.getElementById("ProgressPercentage");
    const resultLabel = document.getElementById("ResultLabel");

    // Función para ocultar resultados
    const ocultarResultados = () => {
        resultado.classList.remove("mostrar");
        resultado.style.display = "none";
    };

    // Función para limpiar todo
    const limpiarEstado = () => {
        error.classList.remove("mostrar");
        error.classList.remove("exito");
        ocultarResultados();
    };

    // Función para actualizar la barra de progreso
    const actualizarBarraProgreso = (porcentajeValor) => {
        progressBar.style.width = porcentajeValor + '%';
        progressPercentage.textContent = porcentajeValor + '%';

        const containerWidth = progressBar.parentElement.offsetWidth;
        const barWidth = (porcentajeValor / 100) * containerWidth;
        progressPercentage.style.left = barWidth + 'px';

        let nivel = 'bajo';
        let textoLabel = 'Bajo';

        if (porcentajeValor >= 80) {
            nivel = 'critico';
            textoLabel = 'Crítico';
        } else if (porcentajeValor >= 60) {
            nivel = 'alto';
            textoLabel = 'Alto';
        } else if (porcentajeValor >= 30) {
            nivel = 'medio';
            textoLabel = 'Moderado';
        } else {
            nivel = 'bajo';
            textoLabel = 'Bajo';
        }

        progressBar.className = 'progress-bar ' + nivel;
        resultLabel.className = 'result-label ' + nivel;
        resultLabel.textContent = textoLabel;

        nivelSimilitud.innerHTML = `Nivel: <span class="result-label ${nivel}">${textoLabel}</span>`;
        porcentajeExacto.textContent = `Porcentaje de similitud: ${porcentajeValor}%`;
    };

    boton.addEventListener("click", async () => {
        // Limpiar estado previo
        limpiarEstado();

        if (text.value.length === 0) {
            error.innerHTML = "El texto no puede estar vacío";
            error.classList.add("mostrar");
            return;
        }

        // Mostrar estado de carga
        boton.classList.add("cargando");
        boton.disabled = true;

        try {
            const response = await fetch("/api/project/university/calculate/plagiarism", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    textUser: text.value
                })
            });

            const data = await response.json();

            if (data.success) {
                const porcentajeValor = data.data.porcentaje;

                // Verificar si el porcentaje es menor a 10%
                if (porcentajeValor < 10) {
                    error.innerHTML = "✅ Este texto no es plagio (similitud menor al 10%)";
                    error.classList.add("mostrar");
                    error.classList.add("exito");
                    ocultarResultados();
                } else {
                    // Mostrar resultados completos
                    autor.innerHTML = "Autor: " + data.data.autor;
                    titulo.innerHTML = "Titulo: " + data.data.titulo;
                    fecha.innerHTML = "Fecha: " + data.data.fecha;

                    actualizarBarraProgreso(0);

                    resultado.style.display = "block";
                    resultado.classList.add("mostrar");

                    setTimeout(() => {
                        actualizarBarraProgreso(porcentajeValor);
                    }, 300);
                }

            } else {
                error.innerHTML = data.message || "Error al procesar la solicitud";
                error.classList.add("mostrar");
                ocultarResultados();
            }
        } catch (err) {
            error.innerHTML = "Error de conexión. Intente nuevamente.";
            error.classList.add("mostrar");
            ocultarResultados();
        } finally {
            boton.classList.remove("cargando");
            boton.disabled = false;
        }
    });

    // Limpiar cuando el usuario escriba
    text.addEventListener("input", () => {
        limpiarEstado();
    });
};

addEventListener('DOMContentLoaded', SendText);