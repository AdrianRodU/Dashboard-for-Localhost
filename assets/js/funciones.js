// ============================== //
// ⚙️  Configuración base global
// ============================== //

// Identifica en qué carpeta estás trabajando ("root" si estás en localhost directamente)
const basePath = location.pathname.split("/")[1] || "root";
const claveFavoritos = `favorites-${basePath}`;
const claveOcultos = `ocultas-${basePath}`;

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
            <i class='fas fa-pencil-alt ' onclick='event.stopPropagation(); renameFolder("${folder}")'></i>
            <i class='fas fa-trash ' onclick='deleteFolder("${folder}")'></i>
            <i class='fas fa-star ' onclick='toggleFavorite("${folder}", this)'></i>
            <i class='fas fa-eye-slash ' onclick='hideFolder("${folder}")'></i>
            <i class='fas fa-search' title='Vista previa' onclick='event.stopPropagation(); verContenidoCarpeta("${folder}")'></i>
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
    const dark = localStorage.getItem("modoOscuro") === "true";
    if (dark) {
        document.body.classList.add("dark");
        // document.querySelector('.btn-outline-dark').textContent = '☀️';
    }
    setInterval(() => {
        document.getElementById("time").textContent = new Date().toLocaleString();
    }, 1000);


});

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
        title: 'Configurar saludo',
        html: `
        <input id="nuevoNombreInput" class="swal2-input" placeholder="Tu nombre" value="${actual}">
        ${actual ? `
          <button id="borrarNombreBtn" class="swal2-styled swal2-cancel mt-2" style="background:#e74c3c;">
            Borrar nombre
          </button>
        ` : ""}
      `,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        didOpen: () => {
            const btnBorrar = document.getElementById("borrarNombreBtn");

            if (btnBorrar) {
                btnBorrar.addEventListener("click", () => {
                    localStorage.removeItem(clave);
                    Swal.close();
                    showToast("Se eliminó el nombre personalizado", "error", "custom-error");

                    const saludoEl = document.getElementById("saludoInicial");
                    if (saludoEl) {
                        saludoEl.textContent = "¡Bienvenido! 👋";
                        // saludoEl.classList.add("animacion-saludo");
                        setTimeout(() => saludoEl.classList.remove("animacion-saludo"), 600);
                    }

                    setTimeout(() => {
                        actualizarSaludo();
                    }, 2000);
                });
            }

            // ✅ Habilitar Enter
            const input = document.getElementById("nuevoNombreInput");
            if (input) {
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

            if (!nuevo) {
                Swal.showValidationMessage("Por favor, escribe tu nombre o usa 'Borrar nombre'");

                inputEl.style.border = "1px solid #dc3545";

                const modal = document.querySelector('.swal2-popup');
                if (modal) {
                    modal.classList.remove("shake-error");
                    void modal.offsetWidth;
                    modal.classList.add("shake-error");
                }

                return false;
            }

            // 🔁 Nueva validación: nombre igual al actual
            const actual = localStorage.getItem(`nombreUsuario-${location.pathname}`) || "";
            if (nuevo === actual) {
                Swal.showValidationMessage("El nombre ingresado es el mismo que el actual");

                inputEl.style.border = "1px solid #dc3545";

                const modal = document.querySelector('.swal2-popup');
                if (modal) {
                    modal.classList.remove("shake-error");
                    void modal.offsetWidth;
                    modal.classList.add("shake-error");
                }

                return false;
            }

            // ✅ Nombre válido: limpiar borde y guardar
            inputEl.style.border = "";
            inputEl.style.boxShadow = "";

            localStorage.setItem(clave, nuevo);
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
//function renderCarpetas() {
function renderCarpetas(folderAnimada = null) {
    const folderGrid = document.getElementById("folderGrid");
    folderGrid.innerHTML = "";
    const ocultas = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
    const favoritas = JSON.parse(localStorage.getItem(claveFavoritos) || "[]");
    // console.log("Favoritas:", favoritas, "Animada:", folderAnimada);
    window.carpetasDisponibles.forEach((folder) => {
        if (!ocultas.includes(folder) && !favoritas.includes(folder)) {
            const item = document.createElement("div");
            const animClass = folder === folderAnimada ? "carpeta-nueva" : "";
            item.className = "col-md-3 col-sm-6";
            item.innerHTML = `
            <div class='card shadow-sm p-3 cursor-pointer ${animClass}' data-folder="${folder}" onclick="abrirCarpeta(event, '${folder}')">
              <div class='d-flex align-items-center mb-2'>
                <i class='fas fa-folder text-warning me-2 fs-4'></i>
                <strong class='flex-grow-1'>${folder}</strong>
              </div>
              <div class='d-flex justify-content-between'>
                <i class='fas fa-pencil-alt ' title='Cambiar nombre' onclick='event.stopPropagation(); renameFolder("${folder}")'></i>
                <i class='fas fa-trash ' title='Eliminar carpeta' onclick='event.stopPropagation(); deleteFolder("${folder}")'></i>
                <i class='fas fa-star ' title='Agregar a favoritos' onclick='event.stopPropagation(); toggleFavorite("${folder}", this)'></i>
                <i class='fas fa-folder-open d-none d-md-inline' title='Abrir carpeta en Windows' onclick='event.stopPropagation(); abrirEnWindows("${folder}")'></i>
                <i class='fas fa-eye-slash ' title='Ocultar carpeta' onclick='event.stopPropagation(); hideFolder("${folder}")'></i>
                <!-- <i class='fas fa-search text-info' title='Vista previa' onclick='event.stopPropagation(); vistaPrevia("${folder}")'></i> -->
                <i class='fas fa-search' title='Vista previa' onclick='event.stopPropagation(); verContenidoCarpeta("${folder}")'></i>
              </div>
            </div>
          `;
            /*item.onclick = () => location.href = folder;*/
            folderGrid.appendChild(item);
            if (folder === folderAnimada) {
                requestAnimationFrame(() => {
                    const el = item.firstElementChild;
                    if (el) {
                        el.classList.add("carpeta-nueva");
                        setTimeout(() => el.classList.remove("carpeta-nueva"), 4000);
                    }
                });
            }
        }
    });
    // Actualiza el contador de carpetas locales visibles
    const totalVisibles = window.carpetasDisponibles.filter((folder) => {
        const ocultas = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
        const favoritas = JSON.parse(localStorage.getItem(claveFavoritos) || "[]");
        return !ocultas.includes(folder) && !favoritas.includes(folder);
    }).length;
    const localCountSpan = document.getElementById("localCount");
    if (localCountSpan) {
        localCountSpan.textContent = totalVisibles;
    }
    // Mostrar mensaje si no hay carpetas locales
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
    // Oculta o muestra el botón
    if (btnQuitar) {
        btnQuitar.style.display = favs.length > 0 ? "inline-block" : "none";
    }
    favs.forEach((folder) => {
        const item = document.createElement("div");
        item.className = "col-md-3 col-sm-6";
        item.innerHTML = `
      <div class='card shadow-sm p-3 cursor-pointer' data-folder="${folder}" onclick="abrirCarpeta(event, '${folder}')">
        <div class='d-flex align-items-center mb-2'>
          <i class='fas fa-folder text-warning me-2 fs-4'></i>
          <strong class='flex-grow-1'>${folder}</strong>
        </div>
        <div class='d-flex justify-content-between'>
          <i class='fas fa-folder-open d-none d-md-inline' title='Abrir carpeta en Windows' onclick='event.stopPropagation(); abrirEnWindows("${folder}")'></i>
          <i class='fas fa-search' title='Vista previa' onclick='event.stopPropagation(); verContenidoCarpeta("${folder}")'></i>
         <i class='fas fa-times text-danger' title='Quitar de favoritos' onclick='removeFavorite(event, "${folder}")'></i>
        </div>
      </div>
    `;
        if (folder === folderAnimado) {
            requestAnimationFrame(() => item.classList.add("fade-in"));
        }
        favList.appendChild(item);
    });
    // Mostrar mensaje si no hay favoritos
    const mensajeSinFavs = document.getElementById("mensajeSinFavoritos");
    if (mensajeSinFavs) {
        mensajeSinFavs.classList.toggle("d-none", favs.length > 0);
    }
}

// Sincroniza los textos de los botones con el estado del modo oscuro
function actualizarTextoModo() {
    const isDark = localStorage.getItem("modoOscuro") === "true";
    // Cambia el texto del botón dentro del dropdown y del offcanvas
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
    localStorage.setItem("modoOscuro", isDark);
    // Actualiza texto del botón principal
    const texto = document.getElementById("modoOscuroTexto");
    const icono = document.getElementById("modoDropdownBtn");
    if (texto) texto.textContent = isDark ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
    if (icono) {
        const isDark = localStorage.getItem("modoOscuro") === "true";
        icono.textContent = isDark ? "☀️" : "🌙";
    }
    // También actualiza el botón dentro del menú lateral
    document.querySelectorAll(".modoOscuroTexto").forEach((el) => {
        el.textContent = isDark ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
    });
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
            // Breadcrumb
            const partes = ruta.split("/").filter(Boolean);
            let breadcrumbHTML = `<nav aria-label="breadcrumb"><ol class="breadcrumb mb-3">`;
            breadcrumbHTML += `<li class="breadcrumb-item"><a href="#" onclick="event.preventDefault(); cerrarYVer('')">📁 Localhost</a></li>`;
            let rutaAcumulada = "";
            partes.forEach((parte, i) => {
                rutaAcumulada += (rutaAcumulada ? "/" : "") + parte;
                const esUltima = i === partes.length - 1;
                breadcrumbHTML += esUltima
                    ? `<li class="breadcrumb-item active" aria-current="page">
       <i class="fas fa-folder-open me-1"></i>${parte}
     </li>`
                    : `<li class="breadcrumb-item">
       <a href="#" onclick="event.preventDefault(); cerrarYVer('${rutaAcumulada}')">
         <i class="fas fa-folder me-1"></i>${parte}
       </a>
     </li>`;
            });
            breadcrumbHTML += `</ol></nav>`;
            modal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Vista previa de: ${ruta || "📁 Raíz"}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              ${breadcrumbHTML}
              <ul class="list-group" id="listaContenidoCarpeta"></ul>
            </div>
            <div class="modal-footer">
              ${ruta
                    ? `<button class="btn btn-outline-secondary" onclick="cerrarYVer('${partes
                        .slice(0, -1)
                        .join("/")}')">⬅️ Atrás</button>`
                    : ""
                }
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      `;
            document.body.appendChild(modal);
            const lista = modal.querySelector("#listaContenidoCarpeta");
            lista.innerHTML = "";
            if (data.length === 0) {
                lista.innerHTML =
                    '<li class="list-group-item">📂 Esta carpeta está vacía</li>';
            } else {
                const carpetas = data.filter((nombre) => nombre.endsWith("/"));
                const archivos = data.filter((nombre) => !nombre.endsWith("/"));
                const elementosOrdenados = [...carpetas, ...archivos];
                elementosOrdenados.forEach((nombre) => {
                    const item = document.createElement("li");
                    item.className =
                        "list-group-item d-flex justify-content-between align-items-center";
                    const esCarpeta = nombre.endsWith("/");
                    if (esCarpeta) {
                        item.innerHTML = `
      <div><i class="fas fa-folder text-warning me-2"></i><strong>${nombre.replace(
                            "/",
                            ""
                        )}</strong></div>
    `;
                        const btn = document.createElement("button");
                        btn.className = "btn btn-sm btn-outline-primary";
                        btn.innerHTML = '<i class="fas fa-eye"></i> Ver carpeta';
                        btn.onclick = () => {
                            const nuevaRuta =
                                (ruta ? ruta + "/" : "") + nombre.replace("/", "");
                            bootstrap.Modal.getInstance(modal).hide();
                            modal.remove();
                            verContenidoCarpeta(nuevaRuta);
                        };
                        item.appendChild(btn);
                    } else {
                        const urlArchivo = (ruta ? ruta + "/" : "") + nombre;
                        const extension = nombre.split(".").pop().toLowerCase();
                        const icono = obtenerIconoPorExtension(extension);
                        if (extension === "pdf") {
                            item.innerHTML = `
    <div class="d-flex align-items-center justify-content-between w-100">
      <div><i class="fas ${icono} me-2"></i>${nombre}</div>
      <button class="btn btn-sm btn-outline-danger" onclick="mostrarArchivoEnModal('${urlArchivo}', '${extension}')">
        <i class="fas fa-eye"></i> Ver PDF
      </button>
    </div>
  `;
                        } else {
                            item.innerHTML = `
    <a href="${urlArchivo}" target="_blank" class="text-decoration-none text-reset w-100 d-flex align-items-center justify-content-between">
      <div><i class="fas ${icono} me-2"></i>${nombre}</div>
      <i class="fas fa-up-right-from-square text-muted"></i>
    </a>
  `;
                        }
                    }
                    lista.appendChild(item);
                });
            }
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
    let contenido = "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
        contenido = `<img src="${url}" class="img-fluid" alt="Vista previa">`;
    } else if (extension === "pdf") {
        contenido = `<iframe src="${url}" width="100%" height="500px" style="border:none;"></iframe>`;
    } else if (extension === "txt") {
        fetch(url).then((res) => res.text());
        modal
            .querySelector(".modal-body")
            .appendChild(pre)
            .then((texto) => {
                const pre = document.createElement("pre");
                pre.textContent = texto;
            });
    }
    modal.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Vista previa del archivo</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body text-center">${contenido}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  `;
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
                    // input.style.boxShadow = "0 0 0 0.2rem rgba(220,53,69,.25)";
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

            input.addEventListener("input", () => {
                confirmBtn.disabled = input.value.trim().toLowerCase() !== "eliminar";
            });
        }
    }).then((result) => {
        if (!result.isConfirmed) return;

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
                            !nombre.startsWith('.') // <-- esto oculta cualquier carpeta tipo .git, .vscode, etc.
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
    modal.innerHTML = `
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Carpetas Ocultas</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <ul id="hiddenFoldersList" class="list-group mb-3"></ul>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-success" id="mostrarTodasBtn">Mostrar todas</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
    const list = modal.querySelector("#hiddenFoldersList");
    const mostrarTodasBtn = modal.querySelector("#mostrarTodasBtn");
    ocultas.forEach((folder) => {
        const li = document.createElement("li");
        li.className =
            "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-folder text-warning"></i>
        <span class="fw-bold">${folder}</span>
      </div>
    `;
        // Botón mostrar
        const btnMostrar = document.createElement("button");
        btnMostrar.className = "btn btn-sm btn-outline-primary me-2";
        btnMostrar.innerHTML = '<i class="fas fa-eye"></i> Mostrar';
        // Botón volver a ocultar
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
            if (restantes.length === 0) {
                mostrarTodasBtn.style.display = "none";
            }
        });
        btnOcultar.addEventListener("click", () => {
            let actuales = JSON.parse(localStorage.getItem(claveOcultos) || "[]");
            if (!actuales.includes(folder)) actuales.push(folder);
            localStorage.setItem(claveOcultos, JSON.stringify(actuales));
            document.cookie = "ocultas=" + JSON.stringify(actuales) + "; path=/";
            renderCarpetas();
            updateFavorites();
            showToast(
                `Carpeta "${folder}" fue ocultada nuevamente`,
                "warning",
                "custom-warning"
            );
            btnOcultar.classList.add("d-none");
            btnMostrar.classList.remove("d-none");
            mostrarTodasBtn.style.display = "inline-block";
        });
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
        showToast(
            "Todas las carpetas fueron restauradas",
            "success",
            "custom-success"
        );
        bootstrap.Modal.getInstance(modal).hide();
    });
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener("hidden.bs.modal", () => {
        modal.remove();
    });
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
    localStorage.setItem(claveFavoritos, JSON.stringify([]));
    document.cookie = "favorites=[]; path=/";
    updateFavorites();
    renderCarpetas();
    showToast(
        "Todos los favoritos han sido eliminados.",
        "error",
        "custom-error"
    );
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
