document.addEventListener("DOMContentLoaded", function () {
    // 📌 Elementos principales de la UI
    const toggleBtn = document.getElementById("toggle-sidebar");
    const sidebar = document.querySelector(".sidebar");
    const breadcrumbDisplay = document.getElementById("current-path");
    const toolbar = document.getElementById("toolbar");

    // 📌 Ventanas
    const ventana = document.getElementById("ventana-comprobantes");
    const cerrarVentana = document.getElementById("cerrar-ventana");
    const minimizarVentana = document.getElementById("minimizar-ventana");

    const ventanaListados = document.getElementById("ventana-listados");
    const cerrarListados = document.getElementById("cerrar-listados");
    const minimizarListados = document.getElementById("minimizar-listados");

    const listadoGenerado = document.getElementById("listado-generado");

    // 📌 Spinner de carga
    const spinner = document.getElementById("spinner-overlay");
    const spinnerMessage = document.getElementById("spinner-message");

    // 📌 Botones de impresión y cerrar listado
    const imprimirBtn = document.querySelector("#ventana-listados .imprimir-btn");
    const cerrarListadoBtn = document.querySelector("#ventana-listados .cerrar-listado-btn");

    // 📌 Variables de estado
    let fixedRootItem = null;
    let lastClickedLink = null;

    // ========================
    // 📍 Funciones auxiliares
    // ========================

    function updateBreadcrumb(pathArray) {
        breadcrumbDisplay.textContent = pathArray.length === 0 ? "Inicio" : pathArray.join(" > ");
    }

    function closeAllSubmenusAndResetFixed() {
        document.querySelectorAll(".submenu").forEach(sub => sub.style.display = "none");
        document.querySelectorAll(".menu-item.active-parent-menu-item").forEach(item =>
            item.classList.remove("active-parent-menu-item")
        );
        fixedRootItem = null;
    }

    function buildPath(link) {
        const path = [link.textContent.replace(" ▸", "").trim()];
        let current = link.closest(".menu-item");

        while (current) {
            const parentLink = current.querySelector("a");
            if (parentLink && parentLink !== link) {
                path.unshift(parentLink.textContent.replace(" ▸", "").trim());
            }
            current = current.closest(".submenu")?.closest(".menu-item");
        }

        return path;
    }

    function markFinalSelected(link) {
        document.querySelectorAll(".selected-final-option").forEach(el =>
            el.classList.remove("selected-final-option")
        );
        link.classList.add("selected-final-option");
    }

    function makeDraggable(ventanaElement) {
        const header = ventanaElement.querySelector(".ventana-header");
        let offsetX = 0, offsetY = 0, isDragging = false;

        header.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - ventanaElement.offsetLeft;
            offsetY = e.clientY - ventanaElement.offsetTop;
            e.preventDefault();
        });

        document.addEventListener("mouseup", () => isDragging = false);
        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            const newLeft = e.clientX - offsetX;
            const newTop = Math.max(20, e.clientY - offsetY);
            ventanaElement.style.left = `${newLeft}px`;
            ventanaElement.style.top = `${newTop}px`;
        });
    }

    async function cargarVentana(idContenedor, rutaArchivo) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    const response = await fetch(rutaArchivo);
    const html = await response.text();
    contenedor.innerHTML = html;

    // Vuelve a aplicar eventos necesarios sobre esa ventana cargada
    if (idContenedor === "contenedor-ventana-comprobantes") {
        makeDraggable(document.getElementById("ventana-comprobantes"));
        // volver a asignar eventos a botones de esa ventana si hace falta
    }
    if (idContenedor === "contenedor-ventana-listados") {
        makeDraggable(document.getElementById("ventana-listados"));
    }
    if (idContenedor === "contenedor-listado-generado") {
        makeDraggable(document.getElementById("listado-generado"));
    }
}


    // ========================
    // 🎯 Menú lateral (sidebar)
    // ========================
    sidebar.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", e => {
            const text = link.textContent.trim().toLowerCase();
            const parentItem = link.closest(".menu-item");
            const nextElement = link.nextElementSibling;
            const isSubmenu = nextElement && nextElement.classList.contains("submenu");

            const path = buildPath(link);
            updateBreadcrumb(path);
            lastClickedLink = link;

            if (isSubmenu) {
                // Mostrar solo el submenu actual
                document.querySelectorAll(".submenu").forEach(sub => {
                    if (sub !== nextElement && !sub.contains(nextElement)) {
                        sub.style.display = "none";
                    }
                });
                nextElement.style.display = "block";

                // Marcar raíz fija
                fixedRootItem = parentItem;
                document.querySelectorAll(".menu-item").forEach(item =>
                    item.classList.remove("active-parent-menu-item")
                );
                parentItem.classList.add("active-parent-menu-item");

            } else {
                e.preventDefault();
                closeAllSubmenusAndResetFixed();
                markFinalSelected(link);

                // Abrir ventanas según la opción seleccionada
                if (text.includes("confección de comprobantes")) {
                    ventana.style.display = "block";
                    const toggleBtnRect = toggleBtn.getBoundingClientRect();
                    toolbar.style.display = "flex";
                    toolbar.style.top = `${toggleBtnRect.top}px`;
                    toolbar.style.left = `${toggleBtnRect.right + 48}px`;
                }

                if (text.includes("listados")) {
                    ventanaListados.style.display = "block";
                    toolbar.style.display = "none";
                }
            }
        });
    });

    // =======================
    // ❌ Botones de ventana
    // =======================
    cerrarVentana?.addEventListener("click", () => {
        ventana.style.display = "none";
        toolbar.style.display = "none";
    });

    minimizarVentana?.addEventListener("click", () => {
        ventana.classList.toggle("minimizada");
    });

    cerrarListados?.addEventListener("click", () => {
        ventanaListados.style.display = "none";
    });

    minimizarListados?.addEventListener("click", () => {
        ventanaListados.classList.toggle("minimizada");
    });

    cerrarListadoBtn?.addEventListener("click", () => {
        ventanaListados.style.display = "none";
    });

    // ======================
    // 🖨️ Impresión simulada
    // ======================
    imprimirBtn?.addEventListener("click", () => {
        spinnerMessage.textContent = "Procesando impresión...";
        spinner.style.display = "flex";

        setTimeout(() => {
            spinner.style.display = "none";
            const fueExitoso = Math.random() < 0.5;

            if (fueExitoso) {
                ventanaListados.style.display = "none";
                listadoGenerado.style.display = "block";
            } else {
                const toast = document.createElement("div");
                toast.textContent = "❌ Error al generar el listado";
                toast.style.position = "fixed";
                toast.style.top = "60px";
                toast.style.left = "50%";
                toast.style.transform = "translateX(-50%)";
                toast.style.background = "#ef4444";
                toast.style.color = "white";
                toast.style.padding = "12px 24px";
                toast.style.borderRadius = "10px";
                toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
                toast.style.fontSize = "16px";
                toast.style.fontWeight = "500";
                toast.style.zIndex = "100000";
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
        }, 2000);
    });

    // ============================
    // 💾 Guardar comprobante
    // ============================
    const btnGuardar = document.getElementById("btn-guardar");
    btnGuardar?.addEventListener("click", () => {
        spinnerMessage.textContent = "Guardando comprobante...";
        spinner.style.display = "flex";

        setTimeout(() => {
            spinner.style.display = "none";
            const fueExitoso = Math.random() < 0.5;

            const toast = document.createElement("div");
            toast.textContent = fueExitoso
                ? "✅ Comprobante guardado correctamente"
                : "❌ Error al guardar comprobante. Por favor, comuniquese con Gauss.";
            toast.style.position = "fixed";
            toast.style.top = "60px";
            toast.style.left = "50%";
            toast.style.transform = "translateX(-50%)";
            toast.style.background = fueExitoso ? "#10b981" : "#ef4444";
            toast.style.color = "white";
            toast.style.padding = "12px 24px";
            toast.style.borderRadius = "10px";
            toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
            toast.style.fontSize = "16px";
            toast.style.fontWeight = "500";
            toast.style.zIndex = "100000";
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }, 2000);
    });

    // ========================
    // 🖱️ Ventanas arrastrables
    // ========================
    makeDraggable(ventana);
    makeDraggable(ventanaListados);
    makeDraggable(listadoGenerado);

    // ========================
    // 🔁 Eventos globales
    // ========================
    document.addEventListener("click", (e) => {
        if (fixedRootItem && !e.target.closest(".sidebar") && !e.target.closest(".ventana")) {
            closeAllSubmenusAndResetFixed();
            updateBreadcrumb([]);
        }
    });

    toggleBtn.addEventListener("click", () => {
        const isClosing = sidebar.classList.toggle("oculta");
        toggleBtn.innerHTML = isClosing ? "&gt;" : "&lt;";
    });

    breadcrumbDisplay.addEventListener("click", () => {
        if (lastClickedLink) lastClickedLink.click();
    });
});



