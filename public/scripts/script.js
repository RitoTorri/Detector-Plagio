const SendText = () => {
    const text = document.getElementById("Texto");
    const boton = document.getElementById("Boton");
    const error = document.getElementById("Error");
    const charCount = document.getElementById("CharCount");

    const resultado = document.getElementById("Resultado");
    const porcentajeValor = document.getElementById("PorcentajeValor");
    const autor = document.getElementById("Autor");
    const titulo = document.getElementById("Titulo");
    const estadoAnalisis = document.getElementById("EstadoAnalisis");

    const progressBar = document.getElementById("ProgressBar");
    const progressPercentage = document.getElementById("ProgressPercentage");
    const resultLabel = document.getElementById("ResultLabel");
    const resultIcon = document.getElementById("ResultIcon");

    // Elementos simplificados
    const palabrasAnalizadas = document.getElementById("PalabrasAnalizadas");

    // Actualizar contador de caracteres
    const actualizarContador = () => {
        charCount.textContent = text.value.length;
    };

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
    const actualizarBarraProgreso = (porcentaje) => {
        progressBar.style.width = porcentaje + '%';
        progressPercentage.textContent = porcentaje + '%';
        porcentajeValor.textContent = porcentaje + '%';

        const containerWidth = progressBar.parentElement.offsetWidth;
        const barWidth = (porcentaje / 100) * containerWidth;
        progressPercentage.style.left = barWidth + 'px';

        let nivel = 'bajo';
        let textoLabel = 'Bajo';
        let iconColor = '#10b981';
        let iconBackground = '#d1fae5';

        if (porcentaje >= 80) {
            nivel = 'critico';
            textoLabel = 'Crítico';
            iconColor = '#dc2626';
            iconBackground = '#fecaca';
        } else if (porcentaje >= 60) {
            nivel = 'alto';
            textoLabel = 'Alto';
            iconColor = '#ef4444';
            iconBackground = '#fee2e2';
        } else if (porcentaje >= 30) {
            nivel = 'medio';
            textoLabel = 'Moderado';
            iconColor = '#f59e0b';
            iconBackground = '#fef3c7';
        } else {
            nivel = 'bajo';
            textoLabel = 'Bajo';
            iconColor = '#10b981';
            iconBackground = '#d1fae5';
        }

        progressBar.className = 'progress-bar ' + nivel;
        resultLabel.className = 'level-badge ' + nivel;
        resultLabel.textContent = textoLabel;

        // Actualizar color del icono
        resultIcon.style.background = iconBackground;
        resultIcon.querySelector('svg').style.color = iconColor;
    };

    // Función para mostrar información del documento
    const mostrarInfoDocumento = (data) => {
        if (data && data.data) {
            autor.textContent = data.data.autor || "No disponible";
            titulo.textContent = data.data.titulo || "No disponible";
        } else {
            autor.textContent = "No disponible";
            titulo.textContent = "No disponible";
        }
    };

    // Event listener para el contador de caracteres
    text.addEventListener("input", () => {
        actualizarContador();
        limpiarEstado();
    });

    boton.addEventListener("click", async () => {
        // Limpiar estado previo
        limpiarEstado();

        if (text.value.length === 0) {
            error.innerHTML = "El texto no puede estar vacío";
            error.classList.add("mostrar");
            return;
        }

        if (text.value.length < 50) {
            error.innerHTML = "El texto debe tener al menos 50 caracteres";
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
                const porcentaje = parseFloat(data.data.porcentaje);
                const esPlagio = data.data.esPlagio;

                // Mostrar información adicional
                palabrasAnalizadas.textContent = data.data.palabrasComparadas || 'N/A';

                // VERIFICAR SI ES PLAGIO O NO
                if (!esPlagio) {
                    // SI NO ES PLAGIO - mostrar mensaje de éxito
                    error.innerHTML = `✅ Este texto no es plagio (${porcentaje}% de similitud)`;
                    error.classList.add("mostrar");
                    error.classList.add("exito");
                    estadoAnalisis.textContent = "Sin plagio";
                } else {
                    // SI ES PLAGIO - mostrar toda la información
                    error.innerHTML = `⚠️ Posible plagio detectado (${porcentaje}% de similitud)`;
                    error.classList.add("mostrar");
                    estadoAnalisis.textContent = "Posible plagio";
                }

                // Mostrar información del documento
                mostrarInfoDocumento(data);

                // Mostrar resultados
                actualizarBarraProgreso(0);
                resultado.style.display = "block";
                resultado.classList.add("mostrar");

                setTimeout(() => {
                    actualizarBarraProgreso(porcentaje);
                }, 300);

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

    // Inicializar contador de caracteres
    actualizarContador();
};

addEventListener('DOMContentLoaded', SendText);