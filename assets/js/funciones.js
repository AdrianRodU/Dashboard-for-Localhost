// ============================== //
// ⚙️  Configuración base global
// ============================== //

// Identifica en qué carpeta estás trabajando ("root" si estás en localhost directamente)
const basePath = location.pathname.split("/")[1] || "root";
const claveFavoritos = `favorites-${basePath}`;
const claveOcultos = `ocultas-${basePath}`;
const claveModoOscuro = `modoOscuro-${basePath}`;

// ============================== //
// 🚀 Eventos de inicio
// ============================== //

// Lógica que se ejecuta al cargar la página (muestra toasts, animaciones, modo oscuro, etc.)
document.addEventListener("DOMContentLoaded", () => {
    const carpetaCreada = localStorage.getItem("carpetaCreada");
    if (carpetaCreada) {
        showToast(
            `Carpeta "${carpetaCreada}" fue creada correctamente.`,
            "success",
            "custom-success"
        );
        // Esperar un momento a que se rendericen las tarjetas
        setTimeout(() => {
            const nuevaCard = document.querySelector(
                `[data-folder="${carpetaCreada}"]`
            );
            if (nuevaCard) {
                nuevaCard.classList.add("carpeta-nueva");
                setTimeout(() => {
                    nuevaCard.classList.remove("carpeta-nueva");
                }, 4000);
            }
        }, 300); // Pequeña espera para asegurar que la tarjeta esté lista
        localStorage.removeItem("carpetaCreada");
    }
    const eliminada = localStorage.getItem("carpetaEliminada");
    if (eliminada) {
        showToast(
            `Carpeta "${eliminada}" fue eliminada.`,
            "success",
            "custom-success"
        );
        localStorage.removeItem("carpetaEliminada");
    }
    const renombrada = localStorage.getItem("carpetaRenombrada");
    if (renombrada) {
        setTimeout(() => {
            const tarjeta = document.querySelector(`[data-folder="${renombrada}"]`);
            if (tarjeta) {
                tarjeta.classList.add("carpeta-renombrada");
                setTimeout(() => {
                    tarjeta.classList.remove("carpeta-renombrada");
                }, 4000);
            }
        }, 300);
        showToast(`Carpeta renombrada a "${renombrada}"`, "info", "custom-info");
        localStorage.removeItem("carpetaRenombrada");
    }
    actualizarTextoModo(); // Un solo llamado lo hace todo
    const folderGrid = document.getElementById("folderGrid");
    const ocultas = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
    const favoritas = JSON.parse(localStorage.getItem(claveFavoritos) || "[]");
    window.carpetasDisponibles.forEach((folder) => {
        if (!ocultas.includes(folder) && !favoritas.includes(folder)) {
            const item = document.createElement("div");
            item.className = "col-md-3 col-sm-6";
            item.innerHTML = `
        <div class='card shadow-sm p-3 cursor-pointer' data-folder="${folder}" onclick="abrirCarpeta(event, '${folder}')">
          <div class='d-flex align-items-center mb-2'>
            <i class='fas fa-folder text-warning me-2 fs-4'></i>
            <strong class='flex-grow-1'>${folder}</strong>
          </div>
          <div class='d-flex justify-content-between'>
            <i class='fas fa-pencil-alt ' data-bs-toggle='tooltip' data-bs-placement='bottom' onclick='event.stopPropagation(); renameFolder("${folder}")'></i>
            <i class='fas fa-trash ' data-bs-toggle='tooltip' data-bs-placement='bottom' onclick='deleteFolder("${folder}")'></i>
            <i class='fas fa-star ' data-bs-toggle='tooltip' data-bs-placement='bottom' onclick='toggleFavorite("${folder}", this)'></i>
            <i class='fas fa-eye-slash ' data-bs-toggle='tooltip' data-bs-placement='bottom' onclick='hideFolder("${folder}")'></i>
            <i class='fas fa-search' data-bs-toggle='tooltip' data-bs-placement='bottom' title='Vista previa' onclick='event.stopPropagation(); verContenidoCarpeta("${folder}")'></i>
          </div>
        </div>
      `;
            /*item.onclick = () => location.href = folder;*/
            folderGrid.appendChild(item);
        }
    });
    document.querySelectorAll(".card").forEach((card) => {
        const name = card.getAttribute("data-folder");
        if (ocultas.includes(name)) {
            const contenedor = card.closest('[class^="col-"]');
            if (contenedor) contenedor.style.display = "none";
        }
    });

    updateFavorites();
    renderCarpetas();

    const isDark = localStorage.getItem(claveModoOscuro) === "true";
    if (isDark) document.body.classList.add("dark");
    actualizarTextoModo(); // Esto actualizará textos e íconos

    setInterval(() => {
        document.getElementById("time").textContent = new Date().toLocaleString();
    }, 1000);

    activarTooltips(); // activa todos los tooltips del DOM inicial

});

function activarTooltips(contenedor = document) {
    const tooltipElements = contenedor.querySelectorAll('[data-bs-toggle="tooltip"]');

    tooltipElements.forEach(el => {
        // Si ya existe, destruye para reiniciar correctamente
        const oldTooltip = bootstrap.Tooltip.getInstance(el);
        if (oldTooltip) oldTooltip.dispose();

        // Crea uno nuevo con el contenido actualizado
        const tooltip = new bootstrap.Tooltip(el);

        // Oculta el tooltip al hacer clic para evitar que se congele
        el.addEventListener("click", () => tooltip.hide());
    });
}



// ============================== //
// 🧰 Utilidades generales
// ============================== //

// Muestra una notificación visual (toast) en la esquina superior derecha
function showToast(message, icon = "info", customClass = "") {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: icon,
        title: message,
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        customClass: {
            popup: customClass, // Aquí aplicas tu clase extra
        },
    });
}

// Retorna la clase de ícono apropiada según la extensión de archivo
function obtenerIconoPorExtension(extension) {
    const ext = extension.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
        return "fa-file-image text-danger";
    if (["pdf"].includes(ext)) return "fa-file-pdf text-danger";
    if (["doc", "docx"].includes(ext)) return "fa-file-word text-primary";
    if (["xls", "xlsx"].includes(ext)) return "fa-file-excel text-success";
    if (["ppt", "pptx"].includes(ext)) return "fa-file-powerpoint text-warning";
    if (["zip", "rar", "7z"].includes(ext)) return "fa-file-archive text-warning";
    if (["mp4", "avi", "mov", "mkv"].includes(ext))
        return "fa-file-video text-purple";
    if (["mp3", "wav"].includes(ext)) return "fa-file-audio text-info";
    if (["txt", "md"].includes(ext)) return "fa-file-lines text-muted";
    // Archivos de código / desarrollo
    if (["html", "htm"].includes(ext)) return "fa-code text-warning";
    if (["php"].includes(ext)) return "fa-code text-indigo";
    if (["js", "mjs"].includes(ext)) return "fa-file-code text-warning";
    if (["css", "scss"].includes(ext)) return "fa-brush text-info";
    if (["json", "xml", "yml", "yaml"].includes(ext)) return "fa-code text-muted";
    if (["sh", "bat", "cmd", "ps1"].includes(ext))
        return "fa-terminal text-light";
    if (["sql"].includes(ext)) return "fa-database text-success";
    // Otros genéricos
    return "fa-file text-secondary";
}

// Actualiza el saludo dinámico según la hora del día
function actualizarSaludo() {
    const ahora = new Date();
    const hora = ahora.getHours();
    const saludoEl = document.getElementById("saludoInicial");

    const claveNombre = `nombreUsuario-${location.pathname}`;
    let nombre = localStorage.getItem(claveNombre);

    // Si es la primera vez, mostrar el modal y luego guardar
    if (!nombre) {
        Swal.fire({
            title: '¡Bienvenido!',
            text: '¿Cuál es tu nombre? 👋',
            input: 'text',
            inputPlaceholder: 'Tu nombre',
            confirmButtonText: 'Guardar',
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputValidator: (value) => {
                if (!value.trim()) {
                    // Aplicar animación shake manual
                    const modal = Swal.getPopup();
                    if (modal) {
                        modal.classList.remove("shake-error");
                        void modal.offsetWidth;
                        modal.classList.add("shake-error");
                    }
                    return 'Por favor, escribe tu nombre';
                }
            }
        }).then((result) => {
            const valor = result.value?.trim();
            if (valor) {
                localStorage.setItem(claveNombre, valor);
                actualizarSaludo();
                showToast(`Nombre guardado como "${valor}"`, "success", "custom-success");
            }
        });

        return; // salimos hasta que el usuario complete
    }

    let saludo = `Hola, ${nombre} 👋`;
    if (hora >= 5 && hora < 12) {
        saludo = `Buenos días, ${nombre} ☀️`;
    } else if (hora >= 12 && hora < 19) {
        saludo = `Buenas tardes, ${nombre} 🌞`;
    } else {
        saludo = `Buenas noches, ${nombre} 🌙`;
    }

    if (saludoEl) saludoEl.textContent = saludo;
}

document.addEventListener("DOMContentLoaded", actualizarSaludo);
setInterval(actualizarSaludo, 60000); // cada 60 segundos

// Modifica el nombre del usuario para dar un saludo dinámico según la hora del día
function cambiarNombreUsuario() {
    const clave = `nombreUsuario-${location.pathname}`;
    const actual = localStorage.getItem(clave) || "";

    Swal.fire({
        title: 'Configurar nombre a mostrar',
        html: `
        <input id="nuevoNombreInput" class="swal2-input" placeholder="Tu nombre" value="${actual}">
        ${actual ? `
          <button id="borrarNombreBtn" class="swal2-styled swal2-cancel mt-2" style="background:#e74c3c;">
            <i class="fa-solid fa-trash-can"></i> Borrar nombre
          </button>
        ` : ""}
      `,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),

        didOpen: () => {

            const btnBorrar = document.getElementById("borrarNombreBtn");

            if (btnBorrar) {
                btnBorrar.addEventListener("click", () => {
                    Swal.fire({
                        title: "¿Estás seguro?",
                        text: "Se eliminará el nombre personalizado guardado.",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Sí, borrar",
                        cancelButtonText: "Cancelar",
                        customClass: {
                            confirmButton: 'btn btn-danger',   // rojo de Bootstrap
                            cancelButton: 'btn btn-secondary'
                        },
                        reverseButtons: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                            localStorage.removeItem(clave);
                            Swal.close();

                            showToast("Se eliminó el nombre personalizado", "error", "custom-error");

                            const saludoEl = document.getElementById("saludoInicial");
                            if (saludoEl) {
                                saludoEl.textContent = "¡Bienvenido! 👋";
                                saludoEl.classList.add("animacion-saludo");
                                setTimeout(() => saludoEl.classList.remove("animacion-saludo"), 600);
                            }

                            setTimeout(() => {
                                actualizarSaludo();
                            }, 4000);
                        } else if (result.dismiss === Swal.DismissReason.cancel) {
                            showToast("No se borró el nombre", "info", "custom-info");
                        }
                    });
                });
            }

            // ✅ Habilitar Enter
            const input = document.getElementById("nuevoNombreInput");
            if (input) {
                // ✅ Enfocar manualmente
                input.focus();

                // ✅ Mover el cursor al final
                const valor = input.value;
                input.value = "";
                input.value = valor;

                // Soporte para Enter
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        Swal.clickConfirm();
                    }
                });
            }
        },

        preConfirm: () => {
            const inputEl = document.getElementById("nuevoNombreInput");
            const nuevo = inputEl.value.trim();
            const actual = localStorage.getItem(`nombreUsuario-${location.pathname}`) || "";

            const modal = Swal.getPopup();

            // Si el campo está vacío
            if (!nuevo) {
                Swal.showValidationMessage("Por favor, escribe tu nombre o usa 'Borrar nombre'");
                inputEl.style.border = "1px solid #dc3545";
                inputEl.style.boxShadow = "0 0 0 0.2rem rgba(220,53,69,.25)";
                if (modal) {
                    modal.classList.remove("shake-error");
                    void modal.offsetWidth;
                    modal.classList.add("shake-error");
                }
                return false;
            }

            // Si el nuevo nombre es igual al actual
            if (nuevo === actual) {
                Swal.showValidationMessage("El nombre ingresado es el mismo que el actual");
                inputEl.style.border = "1px solid #dc3545";
                inputEl.style.boxShadow = "0 0 0 0.2rem rgba(220,53,69,.25)";
                if (modal) {
                    modal.classList.remove("shake-error");
                    void modal.offsetWidth;
                    modal.classList.add("shake-error");
                }
                return false;
            }

            // Si es válido
            inputEl.style.border = "";
            inputEl.style.boxShadow = "";

            localStorage.setItem(`nombreUsuario-${location.pathname}`, nuevo);
            actualizarSaludo();
            showToast(`Nombre guardado como "${nuevo}"`, "success", "custom-success");
        }

    }).then((result) => {
        // Esto ocurre SIEMPRE al cerrar el modal (confirmar o cancelar)
        const modal = document.querySelector('.swal2-popup');
        if (modal) {
            modal.classList.remove("shake-error"); // quitar cualquier clase pendiente
            modal.style.animation = ''; // también quitar animación en línea por si existe
        }
    });
}



// ============================== //
// 🎨 Renderizado de interfaz
// ============================== //

// Abre la carpeta seleccionada navegando a su ruta relativa
function abrirCarpeta(event, folder) {
    const ignorar = event.target.closest("i, button, .btn, .fa");
    if (!ignorar) {
        window.location.href = `${folder}/`;
    }
}

// Renderiza todas las carpetas visibles (no ocultas ni favoritas) en el grid principal
// Refactor de renderCarpetas() sin innerHTML
//function renderCarpetas(folderAnimada = null) {
function renderCarpetas(foldersAnimadas = []) {

    if (!Array.isArray(foldersAnimadas)) {
        foldersAnimadas = foldersAnimadas ? [foldersAnimadas] : [];
    }

    const folderGrid = document.getElementById("folderGrid");
    folderGrid.innerHTML = "";
    const ocultas = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
    const favoritas = JSON.parse(localStorage.getItem(claveFavoritos) || "[]");

    window.carpetasDisponibles.forEach((folder) => {
        if (!ocultas.includes(folder) && !favoritas.includes(folder)) {
            const item = document.createElement("div");
            // const animClass = folder === folderAnimada ? "carpeta-nueva" : "";
            const animClass = foldersAnimadas.includes(folder) ? "carpeta-nueva" : "";

            item.className = "col-md-3 col-sm-6";

            const card = document.createElement("div");
            card.className = `card shadow-sm p-3 cursor-pointer ${animClass}`;
            card.dataset.folder = folder;
            card.onclick = (e) => abrirCarpeta(e, folder);

            const header = document.createElement("div");
            header.className = "d-flex align-items-center mb-2";

            const iconFolder = document.createElement("i");
            iconFolder.className = "fas fa-folder text-warning me-2 fs-4";

            const name = document.createElement("strong");
            name.className = "flex-grow-1";
            name.textContent = folder;

            header.appendChild(iconFolder);
            header.appendChild(name);

            const controls = document.createElement("div");
            controls.className = "d-flex justify-content-between";

            const icons = [
                { icon: "fa-pencil-alt", title: "Cambiar nombre", action: () => renameFolder(folder) },
                { icon: "fa-trash", title: "Eliminar carpeta", action: () => deleteFolder(folder) },
                { icon: "fa-star", title: "Agregar a favoritos", action: (e) => toggleFavorite(folder, e.target) },
                { icon: "fa-folder-open d-none d-md-inline", title: "Abrir carpeta en Windows", action: () => abrirEnWindows(folder) },
                { icon: "fa-eye-slash", title: "Ocultar carpeta", action: () => hideFolder(folder) },
                { icon: "fa-search", title: "Vista previa", action: () => verContenidoCarpeta(folder) },
            ];

            icons.forEach(({ icon, title, action }) => {
                const i = document.createElement("i");
                i.className = `fas ${icon}`;
                i.dataset.bsToggle = "tooltip";
                i.dataset.bsPlacement = "bottom";
                i.title = title;
                i.onclick = (e) => {
                    e.stopPropagation();
                    const tip = bootstrap.Tooltip.getInstance(i);
                    if (tip) tip.hide();
                    action(e);
                };
                controls.appendChild(i);
            });

            card.appendChild(header);
            card.appendChild(controls);
            item.appendChild(card);
            folderGrid.appendChild(item);

            // animación visual si es nueva
            if (foldersAnimadas.includes(folder)) {
                requestAnimationFrame(() => {
                    card.classList.add("carpeta-nueva");
                    setTimeout(() => card.classList.remove("carpeta-nueva"), 4000);
                });
            }

            activarTooltips(card);
        }
    });

    const totalVisibles = window.carpetasDisponibles.filter((folder) => {
        return !ocultas.includes(folder) && !favoritas.includes(folder);
    }).length;

    const localCountSpan = document.getElementById("localCount");
    if (localCountSpan) {
        localCountSpan.textContent = totalVisibles;
    }

    const mensajeSinLocales = document.getElementById("mensajeSinLocales");
    if (mensajeSinLocales) {
        mensajeSinLocales.classList.toggle("d-none", totalVisibles > 0);
    }
}


// Dibuja las carpetas favoritas en el grid superior
function updateFavorites(folderAnimado = null) {
    const countSpan = document.getElementById("favoritesCount");
    const favs = JSON.parse(localStorage.getItem(claveFavoritos) || "[]");
    const favList = document.getElementById("favoritesList");
    const btnQuitar = document.getElementById("btnQuitarFavoritos");
    favList.innerHTML = "";
    countSpan.textContent = favs.length;
    renderCarpetas(folderAnimado);
    if (btnQuitar) btnQuitar.style.display = favs.length > 0 ? "inline-block" : "none";

    favs.forEach((folder) => {
        const item = document.createElement("div");
        item.className = "col-md-3 col-sm-6";

        const card = document.createElement("div");
        card.className = "card shadow-sm p-3 cursor-pointer";
        card.dataset.folder = folder;
        card.onclick = (e) => abrirCarpeta(e, folder);

        const header = document.createElement("div");
        header.className = "d-flex align-items-center mb-2";

        const iconFolder = document.createElement("i");
        iconFolder.className = "fas fa-folder text-warning me-2 fs-4";

        const name = document.createElement("strong");
        name.className = "flex-grow-1";
        name.textContent = folder;

        header.appendChild(iconFolder);
        header.appendChild(name);

        const controls = document.createElement("div");
        controls.className = "d-flex justify-content-between";

        const icons = [
            { icon: "fa-folder-open d-none d-md-inline", title: "Abrir carpeta en Windows", action: () => abrirEnWindows(folder) },
            { icon: "fa-search", title: "Vista previa", action: () => verContenidoCarpeta(folder) },
            { icon: "fa-times text-danger", title: "Quitar de favoritos", action: (e) => removeFavorite(e, folder) },
        ];

        icons.forEach(({ icon, title, action }) => {
            const i = document.createElement("i");
            i.className = `fas ${icon}`;
            i.dataset.bsToggle = "tooltip";
            i.dataset.bsPlacement = "bottom";
            i.title = title;
            i.onclick = (e) => {
                e.stopPropagation();
                const tip = bootstrap.Tooltip.getInstance(i);
                if (tip) tip.hide();
                action(e);
            };
            controls.appendChild(i);
        });

        card.appendChild(header);
        card.appendChild(controls);
        item.appendChild(card);
        if (folder === folderAnimado) {
            requestAnimationFrame(() => item.classList.add("fade-in"));
        }
        favList.appendChild(item);
        activarTooltips(item);
    });

    const mensajeSinFavs = document.getElementById("mensajeSinFavoritos");
    if (mensajeSinFavs) {
        mensajeSinFavs.classList.toggle("d-none", favs.length > 0);
    }
}

// Sincroniza los textos de los botones con el estado del modo oscuro
function actualizarTextoModo() {
    const isDark = localStorage.getItem(claveModoOscuro) === "true";

    // Cambia el texto de todos los botones con esa clase
    document.querySelectorAll(".modoOscuroTexto").forEach((el) => {
        el.textContent = isDark ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
    });

    // Cambia el ícono del botón hamburguesa superior
    const icono = document.getElementById("modoDropdownBtn");
    if (icono) icono.textContent = isDark ? "☀️" : "🌙";
}

// Cambia entre modo claro y oscuro, actualiza íconos y textos
function toggleDarkMode() {
    const isDark = document.body.classList.toggle("dark");

    // Guardar el nuevo estado con clave por carpeta
    localStorage.setItem(claveModoOscuro, isDark);

    // Actualizar todos los textos e íconos de modo
    actualizarTextoModo();
}

// Cierra cualquier modal abierto y luego muestra el contenido de otra carpeta
function cerrarYVer(ruta) {
    // Quitar el foco antes de cerrar
    document.activeElement?.blur();
    // Cerrar todos los modales visibles con una promesa
    const cerrarModales = Array.from(
        document.querySelectorAll(".modal.show")
    ).map((modal) => {
        return new Promise((resolve) => {
            const instancia = bootstrap.Modal.getInstance(modal);
            if (instancia) {
                modal.addEventListener(
                    "hidden.bs.modal",
                    () => {
                        modal.remove();
                        resolve();
                    },
                    {
                        once: true,
                    }
                );
                instancia.hide();
            } else {
                modal.remove();
                resolve();
            }
        });
    });
    // Cuando todos se hayan cerrado, abrir el nuevo
    Promise.all(cerrarModales).then(() => {
        verContenidoCarpeta(ruta);
    });
}

// Solicita al servidor el contenido de una carpeta y muestra un modal con su vista previa
function verContenidoCarpeta(ruta = "") {
    fetch("ver-archivos.php?ruta=" + encodeURIComponent(ruta))
        .then((res) => res.json())
        .then((data) => {
            const modal = document.createElement("div");
            modal.className = "modal fade";
            modal.tabIndex = -1;

            const dialog = document.createElement("div");
            dialog.className = "modal-dialog modal-lg modal-dialog-scrollable";

            const content = document.createElement("div");
            content.className = "modal-content";

            const header = document.createElement("div");
            header.className = "modal-header";
            const title = document.createElement("h5");
            title.className = "modal-title";
            title.textContent = `Vista previa de: ${ruta || "📁 Raíz"}`;
            const closeBtn = document.createElement("button");
            closeBtn.type = "button";
            closeBtn.className = "btn-close";
            closeBtn.setAttribute("data-bs-dismiss", "modal");
            closeBtn.setAttribute("aria-label", "Cerrar");
            header.appendChild(title);
            header.appendChild(closeBtn);

            const body = document.createElement("div");
            body.className = "modal-body";

            const breadcrumb = document.createElement("nav");
            breadcrumb.setAttribute("aria-label", "breadcrumb");
            const ol = document.createElement("ol");
            ol.className = "breadcrumb mb-3";

            const liRaiz = document.createElement("li");
            liRaiz.className = "breadcrumb-item";
            const linkRaiz = document.createElement("a");
            linkRaiz.href = "#";
            linkRaiz.onclick = (e) => {
                e.preventDefault();
                cerrarYVer("");
            };
            linkRaiz.textContent = "📁 Localhost";
            liRaiz.appendChild(linkRaiz);
            ol.appendChild(liRaiz);

            let rutaAcumulada = "";
            const partes = ruta.split("/").filter(Boolean);
            partes.forEach((parte, i) => {
                rutaAcumulada += (rutaAcumulada ? "/" : "") + parte;
                const li = document.createElement("li");
                li.className = "breadcrumb-item";
                if (i === partes.length - 1) {
                    li.classList.add("active");
                    li.setAttribute("aria-current", "page");
                    li.innerHTML = `<i class='fas fa-folder-open me-1'></i>${parte}`;
                } else {
                    const a = document.createElement("a");
                    a.href = "#";
                    a.innerHTML = `<i class='fas fa-folder me-1'></i>${parte}`;
                    a.onclick = (e) => {
                        e.preventDefault();
                        cerrarYVer(rutaAcumulada);
                    };
                    li.appendChild(a);
                }
                ol.appendChild(li);
            });

            breadcrumb.appendChild(ol);
            body.appendChild(breadcrumb);

            const lista = document.createElement("ul");
            lista.className = "list-group";
            lista.id = "listaContenidoCarpeta";
            body.appendChild(lista);

            if (data.length === 0) {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.textContent = "📂 Esta carpeta está vacía";
                lista.appendChild(li);
            } else {
                const carpetas = data.filter((n) => n.endsWith("/"));
                const archivos = data.filter((n) => !n.endsWith("/"));
                [...carpetas, ...archivos].forEach((nombre) => {
                    const item = document.createElement("li");
                    item.className = "list-group-item d-flex justify-content-between align-items-center";
                    const esCarpeta = nombre.endsWith("/");

                    if (esCarpeta) {
                        const div = document.createElement("div");
                        div.innerHTML = `<i class='fas fa-folder text-warning me-2'></i><strong>${nombre.replace("/", "")}</strong>`;
                        const btn = document.createElement("button");
                        btn.className = "btn btn-sm btn-outline-primary";
                        btn.innerHTML = '<i class="fas fa-eye"></i> Ver carpeta';
                        btn.onclick = () => {
                            const nuevaRuta = (ruta ? ruta + "/" : "") + nombre.replace("/", "");
                            bootstrap.Modal.getInstance(modal).hide();
                            modal.remove();
                            verContenidoCarpeta(nuevaRuta);
                        };
                        item.appendChild(div);
                        item.appendChild(btn);
                    } else {
                        const urlArchivo = (ruta ? ruta + "/" : "") + nombre;
                        const extension = nombre.split(".").pop().toLowerCase();
                        const icono = obtenerIconoPorExtension(extension);

                        if (extension === "pdf") {
                            const div = document.createElement("div");
                            div.className = "d-flex align-items-center justify-content-between w-100";
                            div.innerHTML = `
                <div><i class="fas ${icono} me-2"></i>${nombre}</div>
                <button class="btn btn-sm btn-outline-danger" onclick="mostrarArchivoEnModal('${urlArchivo}', '${extension}')">
                  <i class="fas fa-eye"></i> Ver PDF
                </button>`;
                            item.appendChild(div);
                        } else {
                            const a = document.createElement("a");
                            a.href = urlArchivo;
                            a.target = "_blank";
                            a.className = "text-decoration-none text-reset w-100 d-flex align-items-center justify-content-between";
                            a.innerHTML = `
                <div><i class="fas ${icono} me-2"></i>${nombre}</div>
                <i class="fas fa-up-right-from-square text-muted"></i>`;
                            item.appendChild(a);
                        }
                    }

                    lista.appendChild(item);
                });
            }

            const footer = document.createElement("div");
            footer.className = "modal-footer";
            if (ruta) {
                const btnAtras = document.createElement("button");
                btnAtras.className = "btn btn-outline-secondary";
                btnAtras.textContent = "⬅️ Atrás";
                btnAtras.onclick = () => cerrarYVer(partes.slice(0, -1).join("/"));
                footer.appendChild(btnAtras);
            }
            const btnCerrar = document.createElement("button");
            btnCerrar.className = "btn btn-secondary";
            btnCerrar.textContent = "Cerrar";
            btnCerrar.setAttribute("data-bs-dismiss", "modal");
            footer.appendChild(btnCerrar);

            content.appendChild(header);
            content.appendChild(body);
            content.appendChild(footer);
            dialog.appendChild(content);
            modal.appendChild(dialog);
            document.body.appendChild(modal);

            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            modal.addEventListener("hidden.bs.modal", () => modal.remove());
        });
}

// Muestra el contenido de un archivo dentro de un modal (PDF, imagen, texto plano)
function mostrarArchivoEnModal(url, extension) {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.tabIndex = -1;

    const dialog = document.createElement("div");
    dialog.className = "modal-dialog modal-lg modal-dialog-scrollable";

    const content = document.createElement("div");
    content.className = "modal-content";

    const header = document.createElement("div");
    header.className = "modal-header";

    const title = document.createElement("h5");
    title.className = "modal-title";
    title.textContent = "Vista previa del archivo";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-close";
    closeBtn.setAttribute("data-bs-dismiss", "modal");
    closeBtn.setAttribute("aria-label", "Cerrar");

    header.appendChild(title);
    header.appendChild(closeBtn);

    const body = document.createElement("div");
    body.className = "modal-body text-center";

    let contenido;
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
        const img = document.createElement("img");
        img.src = url;
        img.className = "img-fluid";
        img.alt = "Vista previa";
        contenido = img;
    } else if (extension === "pdf") {
        const iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.width = "100%";
        iframe.height = "500px";
        iframe.style.border = "none";
        contenido = iframe;
    } else {
        const mensaje = document.createElement("p");
        mensaje.textContent = `No se puede previsualizar este tipo de archivo.`;
        contenido = mensaje;
    }

    body.appendChild(contenido);

    const footer = document.createElement("div");
    footer.className = "modal-footer";

    const cerrarBtn = document.createElement("button");
    cerrarBtn.type = "button";
    cerrarBtn.className = "btn btn-secondary";
    cerrarBtn.setAttribute("data-bs-dismiss", "modal");
    cerrarBtn.textContent = "Cerrar";

    footer.appendChild(cerrarBtn);

    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);

    dialog.appendChild(content);
    modal.appendChild(dialog);

    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener("hidden.bs.modal", () => modal.remove());
}

// ============================== //
// 📁 Acciones sobre carpetas
// ============================== //

// Muestra un popup para crear una nueva carpeta y la envía como formulario
function crearCarpeta() {
    let resultadoSwal = null;

    Swal.fire({
        title: "Crear nueva carpeta",
        input: "text",
        inputLabel: "Nombre de la carpeta",
        inputPlaceholder: "Ej: proyecto-landing",
        showCancelButton: true,
        confirmButtonText: "Crear",
        cancelButtonText: "Cancelar",
        didOpen: () => {
            const input = Swal.getInput();
            if (input) {
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        Swal.clickConfirm();
                    }
                });
            }
        },
        inputValidator: (value) => {
            const nombre = value.trim();
            const input = Swal.getInput();

            if (!nombre) {
                if (input) {
                    input.style.border = "1px solid #dc3545";
                    input.style.boxShadow = "0 0 0 0.2rem rgba(220,53,69,.25)";
                }
                const modal = Swal.getPopup();
                if (modal) {
                    modal.classList.remove("shake-error");
                    void modal.offsetWidth;
                    modal.classList.add("shake-error");
                }
                return "Debes ingresar un nombre";
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(nombre))
                return "Solo letras, números, guiones o guiones bajos";

            if (window.carpetasDisponibles.includes(nombre))
                return `❌ Ya existe una carpeta llamada "${nombre}"`;
        }
    })
        .then((result) => {
            resultadoSwal = result;
            if (!result.isConfirmed) return;

            const nombreCarpeta = result.value.trim();

            return fetch(window.location.pathname, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action: "create",
                    folderName: nombreCarpeta,
                }),
            }).then(() => {
                return fetch("ver-archivos.php")
                    .then((res) => res.json())
                    .then((items) => {
                        const carpetasFiltradas = items
                            .filter(item => item.endsWith("/"))
                            .map(c => c.slice(0, -1))
                            .filter(nombre =>
                                !carpetasOcultasSistema.includes(nombre) &&
                                !nombre.startsWith('.')
                            );

                        window.carpetasDisponibles = carpetasFiltradas;
                        renderCarpetas(nombreCarpeta);

                        const tarjeta = document.querySelector(`[data-folder="${nombreCarpeta}"]`);
                        if (tarjeta) {
                            tarjeta.classList.add("carpeta-nueva");
                            setTimeout(() => tarjeta.classList.remove("carpeta-nueva"), 4000);
                        }

                        showToast(`Carpeta "${nombreCarpeta}" creada`, "success", "custom-success");
                    });
            });
        })
        .finally(() => {
            if (!resultadoSwal?.isConfirmed) {
                const modal = Swal.getPopup();
                if (modal) {
                    modal.classList.remove("shake-error");
                    modal.style.animation = '';
                }
            }
        });
}


// Muestra un prompt para renombrar una carpeta y envía el formulario al servidor
function renameFolder(folder) {
    let resultadoSwal = null;

    Swal.fire({
        title: "Renombrar carpeta",
        input: "text",
        inputLabel: "Nuevo nombre",
        inputValue: folder,
        showCancelButton: true,
        confirmButtonText: "Renombrar",
        cancelButtonText: "Cancelar",
        didOpen: () => {
            const input = Swal.getInput();
            if (input) {
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        Swal.clickConfirm();
                    }
                });
            }
        },
        inputValidator: (value) => {
            const nombre = value.trim();
            const input = Swal.getInput();

            if (!nombre) {
                if (input) {
                    input.style.border = "1px solid #dc3545";
                    input.style.boxShadow = "0 0 0 0.2rem rgba(220,53,69,.25)";
                }
                const modal = Swal.getPopup();
                if (modal) {
                    modal.classList.remove("shake-error");
                    void modal.offsetWidth;
                    modal.classList.add("shake-error");
                }
                return "Debes ingresar un nuevo nombre";
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(nombre)) return "Solo letras, números, guiones o guiones bajos";

            if (nombre === folder) {
                const modal = Swal.getPopup();
                if (modal) {
                    modal.classList.remove("shake-error");
                    void modal.offsetWidth;
                    modal.classList.add("shake-error");
                }
                return "El nombre es el mismo";
            }
        }
    })
        .then((result) => {
            resultadoSwal = result;

            if (!result.isConfirmed) return;

            const nuevoNombre = result.value.trim();

            return fetch(window.location.pathname, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    action: "rename",
                    oldName: folder,
                    newName: nuevoNombre,
                }),
            }).then(() => {
                return fetch("ver-archivos.php")
                    .then((res) => res.json())
                    .then((items) => {
                        const carpetasFiltradas = items
                            .filter(item => item.endsWith("/"))
                            .map(c => c.slice(0, -1))
                            .filter(nombre =>
                                !carpetasOcultasSistema.includes(nombre) &&
                                !nombre.startsWith('.')
                            );
                        window.carpetasDisponibles = carpetasFiltradas;
                        renderCarpetas(nuevoNombre);

                        const tarjeta = document.querySelector(`[data-folder="${nuevoNombre}"]`);
                        if (tarjeta) {
                            tarjeta.classList.add("carpeta-renombrada");
                            setTimeout(() => tarjeta.classList.remove("carpeta-renombrada"), 4000);
                        }

                        showToast(`Carpeta renombrada a "${nuevoNombre}"`, "info", "custom-info");
                    });
            });
        })
        .finally(() => {
            // ✅ Este bloque se ejecuta siempre, así haya cancelado
            if (!resultadoSwal?.isConfirmed) {
                const modal = Swal.getPopup();
                if (modal) {
                    modal.classList.remove("shake-error");
                    modal.style.animation = '';
                }
            }
        });
}



// Muestra confirmación para eliminar una carpeta y envía el formulario
function deleteFolder(folder) {
    Swal.fire({
        title: `¿Eliminar la carpeta "${folder}"?`,
        html: `
        <p class="mb-2">Esta acción no se puede deshacer.</p>
        <p class="text-muted mb-2">Escribe <strong>eliminar</strong> para confirmar.</p>
        <input type="text" id="confirmInput" class="swal2-input" placeholder="Escribe: eliminar">
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar carpeta",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        didOpen: () => {
            const input = document.getElementById("confirmInput");
            const confirmBtn = Swal.getConfirmButton();
            confirmBtn.disabled = true;

            if (input) {
                input.focus();

                input.addEventListener("input", () => {
                    confirmBtn.disabled = input.value.trim().toLowerCase() !== "eliminar";
                });

                input.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        const valor = input.value.trim().toLowerCase();

                        if (valor === "eliminar") {
                            Swal.clickConfirm(); // ✅ Ejecuta como si presionara el botón
                        } else {
                            // ❌ Shake manual y marca en rojo si no escribió bien
                            input.style.border = "1px solid #dc3545";
                            input.style.boxShadow = "0 0 0 0.2rem rgba(220,53,69,.25)";
                            const modal = Swal.getPopup();
                            if (modal) {
                                modal.classList.remove("shake-error");
                                void modal.offsetWidth;
                                modal.classList.add("shake-error");
                            }
                        }
                    }
                });
            }
        }

    }).then((result) => {
        const modal = Swal.getPopup();
        const container = document.querySelector('.swal2-container');

        // ✅ Esto se ejecuta SIEMPRE al cerrar el modal (confirmado o no)
        if (modal) {
            modal.classList.remove("shake-error");
            modal.style.animation = '';
        }

        // ✅ Asegura que se limpie el fondo oscuro del body
        document.body.classList.remove('swal2-shown', 'swal2-height-auto');
        document.body.style.overflow = '';

        // ✅ Limpia también cualquier backdrop de SweetAlert
        if (container) {
            container.classList.remove('swal2-backdrop-show', 'swal2-shown');
        }

        // ✅ Si NO confirmó, salimos
        if (!result.isConfirmed) return;

        // ✅ Si SÍ confirmó, procedemos a eliminar la carpeta
        fetch(window.location.pathname, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                action: "delete",
                folderName: folder,
            }),
        }).then(() => {
            fetch("ver-archivos.php")
                .then((res) => res.json())
                .then((items) => {
                    const carpetasFiltradas = items
                        .filter(item => item.endsWith("/"))
                        .map(c => c.slice(0, -1))
                        .filter(nombre =>
                            !carpetasOcultasSistema.includes(nombre) &&
                            !nombre.startsWith('.')
                        );

                    window.carpetasDisponibles = carpetasFiltradas;
                    renderCarpetas();

                    showToast(`Carpeta "${folder}" eliminada correctamente`, "success", "custom-success");
                });
        });
    });
}

// Alterna el estado de favorito de una carpeta, actualiza el localStorage y la interfaz
function toggleFavorite(folder, btn) {
    let favs = JSON.parse(localStorage.getItem(claveFavoritos) || "[]");
    const esFavorito = favs.includes(folder);
    if (esFavorito) {
        favs = favs.filter((f) => f !== folder);
        localStorage.setItem(claveFavoritos, JSON.stringify(favs));
        document.cookie = `${claveFavoritos}=` + JSON.stringify(favs) + "; path=/";
        setTimeout(() => {
            updateFavorites(folder);
        }, 10); // ✅ Pequeño delay para asegurar relectura
        showToast(
            `Carpeta "${folder}" fue quitada de favoritos.`,
            "warning",
            "custom-warning"
        );
    } else {
        // ✅ Agregar a favoritos
        favs.push(folder);
        localStorage.setItem(claveFavoritos, JSON.stringify(favs));
        document.cookie = `${claveFavoritos}=` + JSON.stringify(favs) + "; path=/";
        updateFavorites(folder); // Se actualiza primero la lista
        renderCarpetas(); // Se actualiza el grid sin la carpeta
        showToast(
            `Carpeta "${folder}" fue agregada a favoritos.`,
            "success",
            "custom-success"
        );
    }
}

// Quita una carpeta de favoritos desde el botón de la tarjeta
function removeFavorite(event, folder) {
    event.stopPropagation();
    let favs = JSON.parse(localStorage.getItem(claveFavoritos) || "[]");
    favs = favs.filter((f) => f !== folder);
    localStorage.setItem(claveFavoritos, JSON.stringify(favs));
    // ⚠️ Agrega este pequeño delay para asegurar sincronización
    setTimeout(() => {
        updateFavorites(folder); // <- pasamos la carpeta correctamente
    }, 10);
    showToast(
        `Carpeta "${folder}" fue quitada de favoritos`,
        "warning",
        "custom-warning"
    );
}

// Oculta una carpeta visualmente y la guarda como oculta en localStorage y cookies
function hideFolder(folder) {
    let ocultas = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
    if (!ocultas.includes(folder)) {
        ocultas.push(folder);
        localStorage.setItem(claveOcultos, JSON.stringify(ocultas));
        document.cookie = `${claveOcultos}=` + JSON.stringify(ocultas) + "; path=/";
        const cards = document.querySelectorAll(`[data-folder="${folder}"]`);
        cards.forEach((card) => {
            const contenedor = card.closest('[class^="col-"]');
            if (contenedor) contenedor.style.display = "none";
        });
        renderCarpetas();
        showToast("Carpeta Ocultada", "warning", "custom-warning");
        actualizarTextoModo(); // ✅ Usamos la nueva función
    }
}

// Muestra un modal con la lista de carpetas ocultas y permite restaurarlas
function mostrarOcultas() {
    let ocultas = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
    if (ocultas.length === 0) {
        showToast("No hay carpetas ocultas.", "info", "custom-info");
        return;
    }
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.tabIndex = -1;

    const dialog = document.createElement("div");
    dialog.className = "modal-dialog modal-dialog-scrollable";

    const content = document.createElement("div");
    content.className = "modal-content";

    const header = document.createElement("div");
    header.className = "modal-header";
    header.innerHTML = `
    <h5 class="modal-title">Carpetas Ocultas</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>`;

    const body = document.createElement("div");
    body.className = "modal-body";

    const list = document.createElement("ul");
    list.id = "hiddenFoldersList";
    list.className = "list-group mb-3";

    const footer = document.createElement("div");
    footer.className = "modal-footer";

    const mostrarTodasBtn = document.createElement("button");
    mostrarTodasBtn.id = "mostrarTodasBtn";
    mostrarTodasBtn.className = "btn btn-outline-success";
    mostrarTodasBtn.textContent = "Mostrar todas";

    const cerrarBtn = document.createElement("button");
    cerrarBtn.className = "btn btn-secondary";
    cerrarBtn.textContent = "Cerrar";
    cerrarBtn.setAttribute("data-bs-dismiss", "modal");

    ocultas.forEach((folder) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        const folderDiv = document.createElement("div");
        folderDiv.className = "d-flex align-items-center gap-2";

        const icon = document.createElement("i");
        icon.className = "fas fa-folder text-warning";

        const span = document.createElement("span");
        span.className = "fw-bold";
        span.textContent = folder;

        folderDiv.appendChild(icon);
        folderDiv.appendChild(span);

        const btnMostrar = document.createElement("button");
        btnMostrar.className = "btn btn-sm btn-outline-primary me-2";
        btnMostrar.innerHTML = '<i class="fas fa-eye"></i> Mostrar';

        const btnOcultar = document.createElement("button");
        btnOcultar.className = "btn btn-sm btn-outline-secondary d-none";
        btnOcultar.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar';

        btnMostrar.addEventListener("click", () => {
            let actuales = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
            const nuevas = actuales.filter((f) => f !== folder);
            localStorage.setItem(claveOcultos, JSON.stringify(nuevas));
            document.cookie = "ocultas=" + JSON.stringify(nuevas) + "; path=/";
            renderCarpetas();
            updateFavorites();
            const tarjeta = document.querySelector(`[data-folder="${folder}"]`);
            if (tarjeta) {
                tarjeta.classList.add("carpeta-nueva");
                setTimeout(() => tarjeta.classList.remove("carpeta-nueva"), 4000);
            }
            showToast(`Carpeta "${folder}" restaurada`, "info", "custom-info");
            btnMostrar.classList.add("d-none");
            btnOcultar.classList.remove("d-none");
            const restantes = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
            if (restantes.length === 0) mostrarTodasBtn.style.display = "none";
        });

        btnOcultar.addEventListener("click", () => {
            let actuales = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
            if (!actuales.includes(folder)) actuales.push(folder);
            localStorage.setItem(claveOcultos, JSON.stringify(actuales));
            document.cookie = "ocultas=" + JSON.stringify(actuales) + "; path=/";
            renderCarpetas();
            updateFavorites();
            showToast(`Carpeta "${folder}" fue ocultada nuevamente`, "warning", "custom-warning");
            btnOcultar.classList.add("d-none");
            btnMostrar.classList.remove("d-none");
            mostrarTodasBtn.style.display = "inline-block";
        });

        li.appendChild(folderDiv);
        li.appendChild(btnMostrar);
        li.appendChild(btnOcultar);
        list.appendChild(li);
    });

    mostrarTodasBtn.addEventListener("click", () => {
        localStorage.setItem(claveOcultos, JSON.stringify([]));
        document.cookie = "ocultas=[]; path=/";
        renderCarpetas();
        updateFavorites();
        ocultas.forEach((folder) => {
            const tarjeta = document.querySelector(`[data-folder="${folder}"]`);
            if (tarjeta) {
                tarjeta.classList.add("carpeta-nueva");
                setTimeout(() => tarjeta.classList.remove("carpeta-nueva"), 4000);
            }
        });
        showToast("Todas las carpetas fueron restauradas", "success", "custom-success");
        bootstrap.Modal.getInstance(modal).hide();
    });

    footer.appendChild(mostrarTodasBtn);
    footer.appendChild(cerrarBtn);
    body.appendChild(list);
    content.appendChild(header);
    content.appendChild(body);
    content.appendChild(footer);
    dialog.appendChild(content);
    modal.appendChild(dialog);
    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener("hidden.bs.modal", () => modal.remove());
}


// Restaura todas las carpetas ocultas
function mostrarTodasOcultas() {
    const ocultas = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
    localStorage.setItem(claveOcultos, JSON.stringify([]));
    document.cookie = "ocultas=[]; path=/";
    renderCarpetas();
    updateFavorites();
    // Aplicar efecto de resaltado a todas las carpetas restauradas
    setTimeout(() => {
        ocultas.forEach((folder) => {
            const restaurada = document.querySelector(`[data-folder="${folder}"]`);
            if (restaurada) {
                restaurada.classList.add("carpeta-nueva");
                setTimeout(() => {
                    restaurada.classList.remove("carpeta-nueva");
                }, 4000);
            }
        });
    }, 300); // Espera para asegurarse que ya están en el DOM
    document.querySelector(".modal.show .btn-close")?.click();
    showToast(
        "Todas las carpetas ocultas han sido restauradas.",
        "success",
        "custom-success"
    );
}

// Elimina todos los favoritos guardados
function quitarTodosFavoritos() {
    const carpetasQuitadas = JSON.parse(localStorage.getItem(claveFavoritos) || "[]");

    if (carpetasQuitadas.length === 0) {
        showToast("No hay carpetas en favoritos.", "info", "custom-info");
        return;
    }

    // Limpiar favoritos
    localStorage.setItem(claveFavoritos, JSON.stringify([]));
    document.cookie = "favorites=[]; path=/";

    updateFavorites(); // limpia favoritos
    renderCarpetas(carpetasQuitadas); // ⚠️ Aquí pasamos las que deben animarse

    // Agregar también .fade-in a cada tarjeta
    setTimeout(() => {
        carpetasQuitadas.forEach((folder) => {
            const tarjeta = document.querySelector(`[data-folder="${folder}"]`);
            if (tarjeta) {
                tarjeta.classList.add("fade-in", "carpeta-nueva");
                setTimeout(() => tarjeta.classList.remove("fade-in", "carpeta-nueva"), 4000);
            }
        });
    }, 300);

    showToast("Todos los favoritos han sido eliminados.", "error", "custom-error");
}



// ============================== //
// 💻 Integración con el sistema
// ============================== //

// Llama al backend para abrir una carpeta específica en el explorador de Windows
function abrirEnWindows(folder) {
    fetch(`abrir-carpeta.php?carpeta=${encodeURIComponent(folder)}`).then(() => {
        showToast(
            `Se abrió la carpeta "${folder}" en el explorador de Windows.`,
            "info",
            "custom-info"
        );
    });
}

// Abre la carpeta raíz de localhost sin importar dónde estés ubicado
function abrirRaizLocalhost() {
    fetch("abrir-carpeta.php?carpeta=root").then(() => {
        showToast("Se abrió la carpeta raíz de localhost.", "info", "custom-info");
    });
}

window.addEventListener("resize", () => {
    const offcanvasElement = document.querySelector(".offcanvas.show");
    if (offcanvasElement && window.innerWidth >= 992) { // puedes ajustar el 992 según tu breakpoint de escritorio
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
        bsOffcanvas?.hide();
    }
});
