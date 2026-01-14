// ============================================================================
// SCRIPT PARA LLENAR AUTOMÁTICAMENTE EL REGISTRO DE DEPORTISTA
// ============================================================================
// Copea este contenido completo y pégalo en la CONSOLA DEL NAVEGADOR (F12)
// Luego presiona Enter
// ============================================================================

// Función para esperar a que un elemento exista en el DOM
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Elemento no encontrado: ${selector}`));
    }, timeout);
  });
}

// Función para establecer valor en un input de manera más robusta
function setInputValue(selector, value) {
  const input = document.querySelector(selector);
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✅ ${selector} = ${value}`);
    return true;
  } else {
    console.warn(`⚠️ No encontrado: ${selector}`);
    return false;
  }
}

// Función para establecer valor en input buscando por label o contenedor
function setInputByLabel(labelText, value) {
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    if (label.textContent.toLowerCase().includes(labelText.toLowerCase())) {
      // Buscar el input asociado
      const parent = label.closest('div');
      if (parent) {
        const input = parent.querySelector('input, textarea, select');
        if (input) {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`✅ ${labelText} = ${value}`);
          return true;
        }
      }
    }
  }
  console.warn(`⚠️ No encontrado label: "${labelText}"`);
  return false;
}

// Función para seleccionar un option en un select
function setSelectValue(selector, value) {
  const select = document.querySelector(selector);
  if (select) {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✅ ${selector} = ${value}`);
    return true;
  } else {
    console.warn(`⚠️ No encontrado: ${selector}`);
    return false;
  }
}

// Función para hacer clic en un botón
function clickButton(text) {
  const buttons = document.querySelectorAll('button');
  const button = Array.from(buttons).find(btn => 
    btn.textContent.toLowerCase().includes(text.toLowerCase())
  );
  if (button) {
    button.click();
    console.log(`✅ Botón "${text}" presionado`);
    return true;
  } else {
    console.warn(`⚠️ Botón no encontrado: "${text}"`);
    return false;
  }
}

// Función para llenar las vacunas
async function llenarVacunas() {
  console.log("\n💉 Iniciando llenado de vacunas...\n");

  // Vacunas predefinidas para agregar
  const vacunas = [
    { nombre: "Tétanos", fecha: new Date().toISOString().split('T')[0], observaciones: "Vacuna al día" },
    { nombre: "Hepatitis", fecha: new Date().toISOString().split('T')[0], observaciones: "Vacuna al día" },
    { nombre: "Influenza", fecha: new Date().toISOString().split('T')[0], observaciones: "Vacuna al día" },
  ];

  for (const vacuna of vacunas) {
    try {
      console.log(`📌 Agregando vacuna: ${vacuna.nombre}...`);

      // Buscar y llenar el select de vacunas
      const selectVacunas = document.querySelector('select');
      if (selectVacunas) {
        selectVacunas.value = vacuna.nombre;
        selectVacunas.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ Vacuna seleccionada: ${vacuna.nombre}`);
      }

      // Esperar un poco
      await new Promise(resolve => setTimeout(resolve, 300));

      // Llenar fecha
      const inputs = document.querySelectorAll('input[type="date"]');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].value = vacuna.fecha;
        inputs[inputs.length - 1].dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ Fecha de administración: ${vacuna.fecha}`);
      }

      // Llenar observaciones
      const textareas = document.querySelectorAll('textarea');
      if (textareas.length > 0) {
        textareas[textareas.length - 1].value = vacuna.observaciones;
        textareas[textareas.length - 1].dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✅ Observaciones: ${vacuna.observaciones}`);
      }

      // Esperar a que se actualice el DOM
      await new Promise(resolve => setTimeout(resolve, 500));

      // Buscar botón "Agregar Vacuna" - MEJORADO
      const buttons = document.querySelectorAll('button');
      let buttonAgregar = null;

      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase();
        // Buscar específicamente "Agregar Vacuna"
        if (text.includes('agregar vacuna') || 
            (text.includes('agregar') && text.includes('vacuna'))) {
          buttonAgregar = btn;
          break;
        }
      }

      if (buttonAgregar) {
        buttonAgregar.click();
        console.log(`✅ Vacuna agregada correctamente\n`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.warn(`⚠️ No se encontró botón 'Agregar Vacuna'`);
        console.log(`📌 Botones con 'agregar' en el texto:`);
        Array.from(buttons).forEach((btn, idx) => {
          if (btn.textContent.toLowerCase().includes('agregar')) {
            console.log(`   [${idx}] ${btn.textContent}`);
          }
        });
      }

    } catch (error) {
      console.error(`❌ Error agregando vacuna ${vacuna.nombre}:`, error.message);
    }
  }

  console.log("✅ VACUNAS AGREGADAS CORRECTAMENTE\n");
}

// Función principal
async function autoRegistrar() {
  console.log("🚀 Iniciando auto-registro de deportista...\n");

  try {
    // Datos de prueba - MODIFICA ESTOS VALORES SEGÚN NECESITES
    const datosDeportista = {
      nombreCompleto: "Test Deportista 001",
      fechaNacimiento: "2000-01-01",
      genero: "masculino",
      tipoDocumento: "cedula_ciudadania",
      numeroDocumento: "9999999999",
      nacionalidad: "Colombia",
      departamento: "Huila",
      ciudad: "Neiva",
      estrato: "3",
      etnia: "Sin especificar",
      telefono: "3001234567",
      correoElectronico: "test@example.com",
      direccion: "Calle Test No. 123",
      disciplina: "Natación",
    };

    console.log("📝 Datos a llenar:");
    console.log(datosDeportista);
    console.log("\n");

    // Esperar a que se carguen los inputs
    console.log("⏳ Esperando a que se carguen los elementos del formulario...");
    
    // Llenar Nombre Completo
    setInputValue('input[placeholder="Ingrese el nombre completo"]', datosDeportista.nombreCompleto);
    
    // Llenar Fecha de Nacimiento
    setInputValue('input[type="date"]', datosDeportista.fechaNacimiento);
    
    // Llenar Género
    setSelectValue('select', datosDeportista.genero);
    
    // Esperar un poco para que se actualicen los selects
    await new Promise(resolve => setTimeout(resolve, 500));

    // Llenar Tipo de Documento
    const tipoDocSelects = document.querySelectorAll('select');
    if (tipoDocSelects.length > 1) {
      tipoDocSelects[1].value = datosDeportista.tipoDocumento;
      tipoDocSelects[1].dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Tipo de documento = ${datosDeportista.tipoDocumento}`);
    }

    // Llenar Número de Documento
    setInputValue('input[type="text"]', datosDeportista.numeroDocumento);

    // Llenar Nacionalidad
    const nacionalidadSelects = document.querySelectorAll('select');
    if (nacionalidadSelects.length > 2) {
      nacionalidadSelects[2].value = datosDeportista.nacionalidad;
      nacionalidadSelects[2].dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Nacionalidad = ${datosDeportista.nacionalidad}`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Llenar Departamento
    const deptoSelects = document.querySelectorAll('select');
    if (deptoSelects.length > 3) {
      deptoSelects[3].value = datosDeportista.departamento;
      deptoSelects[3].dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Departamento = ${datosDeportista.departamento}`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Llenar Ciudad
    const ciudadSelects = document.querySelectorAll('select');
    if (ciudadSelects.length > 4) {
      ciudadSelects[4].value = datosDeportista.ciudad;
      ciudadSelects[4].dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Ciudad = ${datosDeportista.ciudad}`);
    }

    // Llenar Teléfono
    setInputByLabel('teléfono', datosDeportista.telefono) || 
    setInputValue('input[type="tel"]', datosDeportista.telefono);

    // Llenar Correo
    setInputValue('input[type="email"]', datosDeportista.correoElectronico);

    // Llenar Dirección
    setInputByLabel('dirección', datosDeportista.direccion);

    // Llenar Disciplina
    const disciplinaSelects = document.querySelectorAll('select');
    if (disciplinaSelects.length > 5) {
      disciplinaSelects[5].value = datosDeportista.disciplina;
      disciplinaSelects[5].dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`✅ Disciplina = ${datosDeportista.disciplina}`);
    }

    console.log("\n✅ PASO 1 LLENADO CORRECTAMENTE");
    console.log("📌 Presionando botón 'Siguiente'...\n");

    // Esperar un poco antes de hacer clic
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar y presionar el botón "Siguiente"
    const buttons = document.querySelectorAll('button');
    let buttonSiguiente = null;

    for (const btn of buttons) {
      if (btn.textContent.toLowerCase().includes('siguiente') || 
          btn.textContent.toLowerCase().includes('next')) {
        buttonSiguiente = btn;
        break;
      }
    }

    if (buttonSiguiente) {
      buttonSiguiente.click();
      console.log("✅ Botón 'Siguiente' presionado\n");
      
      // Esperar a que cargue el paso 2
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Llenar vacunas
      await llenarVacunas();

      console.log("\n🎉 ¡AUTO-REGISTRO COMPLETADO!");
      console.log("📌 Revisa los datos antes de enviar el formulario");
    } else {
      console.warn("⚠️ No se encontró el botón 'Siguiente'");
      console.log("📌 Haz clic manualmente en 'Siguiente' y ejecuta llenarVacunas() en la consola");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Ejecutar
autoRegistrar();
