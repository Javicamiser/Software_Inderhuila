// Base de datos simplificada de códigos CUPS (Clasificación Única de Procedimientos en Salud - Colombia)
// En producción, esto debería conectarse a una API o base de datos completa

type ProcedimientoCUPS = {
  nombre: string;
  categoria: string;
};

export const CUPS_DATABASE: Record<string, ProcedimientoCUPS> = {
  // LABORATORIOS - Hematología
  "902201": { nombre: "Hemograma completo", categoria: "Laboratorios" },
  "902202": { nombre: "Recuento de leucocitos", categoria: "Laboratorios" },
  "902203": { nombre: "Recuento de eritrocitos", categoria: "Laboratorios" },
  "902204": { nombre: "Hemoglobina", categoria: "Laboratorios" },
  "902205": { nombre: "Hematocrito", categoria: "Laboratorios" },
  "902206": { nombre: "Recuento de plaquetas", categoria: "Laboratorios" },
  "902207": { nombre: "Velocidad de sedimentación globular (VSG)", categoria: "Laboratorios" },
  "902210": { nombre: "Tiempo de protrombina", categoria: "Laboratorios" },
  "902211": { nombre: "Tiempo parcial de tromboplastina", categoria: "Laboratorios" },
  "902212": { nombre: "INR", categoria: "Laboratorios" },
  
  // LABORATORIOS - Química sanguínea
  "903801": { nombre: "Glicemia (glucosa en sangre)", categoria: "Laboratorios" },
  "903802": { nombre: "Hemoglobina glicosilada (HbA1c)", categoria: "Laboratorios" },
  "903805": { nombre: "Creatinina", categoria: "Laboratorios" },
  "903806": { nombre: "Nitrógeno ureico (BUN)", categoria: "Laboratorios" },
  "903807": { nombre: "Ácido úrico", categoria: "Laboratorios" },
  "903810": { nombre: "Colesterol total", categoria: "Laboratorios" },
  "903811": { nombre: "Colesterol HDL", categoria: "Laboratorios" },
  "903812": { nombre: "Colesterol LDL", categoria: "Laboratorios" },
  "903813": { nombre: "Triglicéridos", categoria: "Laboratorios" },
  "903814": { nombre: "Perfil lipídico completo", categoria: "Laboratorios" },
  "903820": { nombre: "Transaminasa GOT (AST)", categoria: "Laboratorios" },
  "903821": { nombre: "Transaminasa GPT (ALT)", categoria: "Laboratorios" },
  "903822": { nombre: "Fosfatasa alcalina", categoria: "Laboratorios" },
  "903823": { nombre: "Bilirrubina total", categoria: "Laboratorios" },
  "903824": { nombre: "Bilirrubina directa", categoria: "Laboratorios" },
  "903830": { nombre: "Proteínas totales", categoria: "Laboratorios" },
  "903831": { nombre: "Albúmina", categoria: "Laboratorios" },
  "903832": { nombre: "Globulina", categoria: "Laboratorios" },
  "903840": { nombre: "Electrolitos (sodio, potasio, cloro)", categoria: "Laboratorios" },
  "903841": { nombre: "Sodio", categoria: "Laboratorios" },
  "903842": { nombre: "Potasio", categoria: "Laboratorios" },
  "903843": { nombre: "Cloro", categoria: "Laboratorios" },
  "903850": { nombre: "Calcio", categoria: "Laboratorios" },
  "903851": { nombre: "Magnesio", categoria: "Laboratorios" },
  "903852": { nombre: "Fósforo", categoria: "Laboratorios" },
  
  // LABORATORIOS - Hormonas
  "904001": { nombre: "Hormona estimulante de la tiroides (TSH)", categoria: "Laboratorios" },
  "904002": { nombre: "Tiroxina libre (T4 libre)", categoria: "Laboratorios" },
  "904003": { nombre: "Triyodotironina (T3)", categoria: "Laboratorios" },
  "904010": { nombre: "Cortisol", categoria: "Laboratorios" },
  "904020": { nombre: "Testosterona", categoria: "Laboratorios" },
  "904030": { nombre: "Estradiol", categoria: "Laboratorios" },
  "904040": { nombre: "Hormona foliculoestimulante (FSH)", categoria: "Laboratorios" },
  "904041": { nombre: "Hormona luteinizante (LH)", categoria: "Laboratorios" },
  "904050": { nombre: "Prolactina", categoria: "Laboratorios" },
  
  // LABORATORIOS - Marcadores
  "904201": { nombre: "Proteína C reactiva (PCR)", categoria: "Laboratorios" },
  "904202": { nombre: "PCR ultrasensible", categoria: "Laboratorios" },
  "904210": { nombre: "Troponina", categoria: "Laboratorios" },
  "904220": { nombre: "Antígeno prostático específico (PSA)", categoria: "Laboratorios" },
  "904230": { nombre: "Ferritina", categoria: "Laboratorios" },
  "904240": { nombre: "Vitamina D", categoria: "Laboratorios" },
  "904241": { nombre: "Vitamina B12", categoria: "Laboratorios" },
  "904250": { nombre: "Ácido fólico", categoria: "Laboratorios" },
  
  // LABORATORIOS - Uroanálisis
  "905101": { nombre: "Uroanálisis completo (parcial de orina)", categoria: "Laboratorios" },
  "905102": { nombre: "Urocultivo", categoria: "Laboratorios" },
  "905103": { nombre: "Proteinuria de 24 horas", categoria: "Laboratorios" },
  "905104": { nombre: "Depuración de creatinina", categoria: "Laboratorios" },
  
  // LABORATORIOS - Microbiología
  "906001": { nombre: "Cultivo de orina", categoria: "Laboratorios" },
  "906002": { nombre: "Cultivo de sangre (hemocultivo)", categoria: "Laboratorios" },
  "906003": { nombre: "Cultivo de heces (coprocultivo)", categoria: "Laboratorios" },
  "906010": { nombre: "Prueba rápida de estreptococo", categoria: "Laboratorios" },
  
  // LABORATORIOS - Inmunología
  "907001": { nombre: "VIH (ELISA)", categoria: "Laboratorios" },
  "907002": { nombre: "Hepatitis B (antígeno de superficie)", categoria: "Laboratorios" },
  "907003": { nombre: "Hepatitis C (anticuerpos)", categoria: "Laboratorios" },
  "907010": { nombre: "VDRL (sífilis)", categoria: "Laboratorios" },
  "907020": { nombre: "Dengue (NS1, IgM, IgG)", categoria: "Laboratorios" },
  
  // IMÁGENES - Radiología simple
  "871201": { nombre: "Radiografía de tórax (PA y lateral)", categoria: "Imágenes" },
  "871202": { nombre: "Radiografía de tórax (PA)", categoria: "Imágenes" },
  "871210": { nombre: "Radiografía de columna cervical", categoria: "Imágenes" },
  "871211": { nombre: "Radiografía de columna dorsal", categoria: "Imágenes" },
  "871212": { nombre: "Radiografía de columna lumbar", categoria: "Imágenes" },
  "871213": { nombre: "Radiografía de columna lumbosacra", categoria: "Imágenes" },
  "871220": { nombre: "Radiografía de rodilla", categoria: "Imágenes" },
  "871221": { nombre: "Radiografía de tobillo", categoria: "Imágenes" },
  "871222": { nombre: "Radiografía de pie", categoria: "Imágenes" },
  "871230": { nombre: "Radiografía de hombro", categoria: "Imágenes" },
  "871231": { nombre: "Radiografía de codo", categoria: "Imágenes" },
  "871232": { nombre: "Radiografía de muñeca", categoria: "Imágenes" },
  "871233": { nombre: "Radiografía de mano", categoria: "Imágenes" },
  "871240": { nombre: "Radiografía de cadera", categoria: "Imágenes" },
  "871250": { nombre: "Radiografía de abdomen simple", categoria: "Imágenes" },
  "871260": { nombre: "Radiografía de cráneo", categoria: "Imágenes" },
  
  // IMÁGENES - Ecografía
  "881201": { nombre: "Ecografía abdominal total", categoria: "Imágenes" },
  "881202": { nombre: "Ecografía abdominal superior", categoria: "Imágenes" },
  "881210": { nombre: "Ecografía pélvica", categoria: "Imágenes" },
  "881220": { nombre: "Ecografía obstétrica", categoria: "Imágenes" },
  "881230": { nombre: "Ecografía de tiroides", categoria: "Imágenes" },
  "881240": { nombre: "Ecografía de mamas", categoria: "Imágenes" },
  "881250": { nombre: "Ecografía renal", categoria: "Imágenes" },
  "881260": { nombre: "Ecografía testicular", categoria: "Imágenes" },
  "881270": { nombre: "Ecografía de partes blandas", categoria: "Imágenes" },
  "881280": { nombre: "Ecografía Doppler vascular", categoria: "Imágenes" },
  "881290": { nombre: "Ecocardiograma transtorácico", categoria: "Imágenes" },
  
  // IMÁGENES - Tomografía computarizada
  "872101": { nombre: "Tomografía de cráneo simple", categoria: "Imágenes" },
  "872102": { nombre: "Tomografía de cráneo con contraste", categoria: "Imágenes" },
  "872110": { nombre: "Tomografía de tórax", categoria: "Imágenes" },
  "872120": { nombre: "Tomografía de abdomen", categoria: "Imágenes" },
  "872130": { nombre: "Tomografía de columna", categoria: "Imágenes" },
  "872140": { nombre: "Angiotomografía", categoria: "Imágenes" },
  
  // IMÁGENES - Resonancia magnética
  "873101": { nombre: "Resonancia magnética de cerebro", categoria: "Imágenes" },
  "873110": { nombre: "Resonancia magnética de columna cervical", categoria: "Imágenes" },
  "873111": { nombre: "Resonancia magnética de columna dorsal", categoria: "Imágenes" },
  "873112": { nombre: "Resonancia magnética de columna lumbar", categoria: "Imágenes" },
  "873120": { nombre: "Resonancia magnética de rodilla", categoria: "Imágenes" },
  "873121": { nombre: "Resonancia magnética de hombro", categoria: "Imágenes" },
  "873130": { nombre: "Resonancia magnética de abdomen", categoria: "Imágenes" },
  
  // IMÁGENES - Densitometría
  "875001": { nombre: "Densitometría ósea (columna y cadera)", categoria: "Imágenes" },
  "875002": { nombre: "Densitometría ósea (columna lumbar)", categoria: "Imágenes" },
  "875003": { nombre: "Densitometría ósea (cadera)", categoria: "Imágenes" },
  
  // PRUEBAS FUNCIONALES - Cardiología
  "890201": { nombre: "Electrocardiograma (ECG) en reposo", categoria: "Pruebas Funcionales" },
  "890202": { nombre: "Electrocardiograma con interpretación", categoria: "Pruebas Funcionales" },
  "890210": { nombre: "Prueba de esfuerzo (ergometría)", categoria: "Pruebas Funcionales" },
  "890211": { nombre: "Prueba de esfuerzo con gases", categoria: "Pruebas Funcionales" },
  "890220": { nombre: "Holter de 24 horas", categoria: "Pruebas Funcionales" },
  "890230": { nombre: "Monitoreo ambulatorio de presión arterial (MAPA)", categoria: "Pruebas Funcionales" },
  "890240": { nombre: "Ecocardiograma transtorácico", categoria: "Pruebas Funcionales" },
  "890241": { nombre: "Ecocardiograma con Doppler", categoria: "Pruebas Funcionales" },
  "890250": { nombre: "Ecocardiograma de estrés (con ejercicio)", categoria: "Pruebas Funcionales" },
  
  // PRUEBAS FUNCIONALES - Neumología
  "891001": { nombre: "Espirometría simple", categoria: "Pruebas Funcionales" },
  "891002": { nombre: "Espirometría con broncodilatador", categoria: "Pruebas Funcionales" },
  "891010": { nombre: "Pulsioximetría", categoria: "Pruebas Funcionales" },
  "891020": { nombre: "Gasometría arterial", categoria: "Pruebas Funcionales" },
  "891030": { nombre: "Prueba de difusión pulmonar (DLCO)", categoria: "Pruebas Funcionales" },
  
  // PRUEBAS FUNCIONALES - Neurología
  "892001": { nombre: "Electroencefalograma (EEG)", categoria: "Pruebas Funcionales" },
  "892010": { nombre: "Electromiografía (EMG)", categoria: "Pruebas Funcionales" },
  "892020": { nombre: "Velocidad de conducción nerviosa", categoria: "Pruebas Funcionales" },
  "892030": { nombre: "Potenciales evocados", categoria: "Pruebas Funcionales" },
  
  // PRUEBAS FUNCIONALES - Audiología
  "893001": { nombre: "Audiometría tonal", categoria: "Pruebas Funcionales" },
  "893002": { nombre: "Audiometría vocal", categoria: "Pruebas Funcionales" },
  "893010": { nombre: "Impedanciometría", categoria: "Pruebas Funcionales" },
  
  // PRUEBAS FUNCIONALES - Oftalmología
  "894001": { nombre: "Agudeza visual", categoria: "Pruebas Funcionales" },
  "894010": { nombre: "Tonometría (presión intraocular)", categoria: "Pruebas Funcionales" },
  "894020": { nombre: "Fondo de ojo", categoria: "Pruebas Funcionales" },
  "894030": { nombre: "Campo visual", categoria: "Pruebas Funcionales" },
  
  // PRUEBAS DEPORTIVAS Y DE ESFUERZO
  "990101": { nombre: "Test de VO2 máx", categoria: "Pruebas Deportivas" },
  "990102": { nombre: "Ergoespirometría", categoria: "Pruebas Deportivas" },
  "990110": { nombre: "Prueba de esfuerzo cardiopulmonar", categoria: "Pruebas Deportivas" },
  "990120": { nombre: "Test de lactato", categoria: "Pruebas Deportivas" },
  "990130": { nombre: "Test de Wingate (potencia anaeróbica)", categoria: "Pruebas Deportivas" },
  "990140": { nombre: "Test de Course Navette (Yoyo test)", categoria: "Pruebas Deportivas" },
  "990150": { nombre: "Valoración isocinética", categoria: "Pruebas Deportivas" },
  "990160": { nombre: "Test de salto vertical", categoria: "Pruebas Deportivas" },
  "990170": { nombre: "Test de velocidad (40 metros)", categoria: "Pruebas Deportivas" },
  "990180": { nombre: "Test de agilidad (Illinois)", categoria: "Pruebas Deportivas" },
  "990190": { nombre: "Composición corporal (bioimpedancia)", categoria: "Pruebas Deportivas" },
  "990191": { nombre: "Composición corporal (DEXA)", categoria: "Pruebas Deportivas" },
  "990192": { nombre: "Composición corporal (pliegues cutáneos)", categoria: "Pruebas Deportivas" },
  "990200": { nombre: "Antropometría deportiva completa", categoria: "Pruebas Deportivas" },
  "990210": { nombre: "Somatotipo (Heath-Carter)", categoria: "Pruebas Deportivas" },
  
  // PROCEDIMIENTOS - Endoscopia
  "850101": { nombre: "Endoscopia digestiva alta", categoria: "Procedimientos" },
  "850102": { nombre: "Colonoscopia", categoria: "Procedimientos" },
  "850110": { nombre: "Rectosigmoidoscopia", categoria: "Procedimientos" },
  "850120": { nombre: "Broncoscopia", categoria: "Procedimientos" },
  
  // OTROS PROCEDIMIENTOS
  "860101": { nombre: "Biopsia de piel", categoria: "Procedimientos" },
  "860102": { nombre: "Biopsia de mama", categoria: "Procedimientos" },
  "860110": { nombre: "Punción lumbar", categoria: "Procedimientos" },
  "860120": { nombre: "Paracentesis", categoria: "Procedimientos" },
  "860130": { nombre: "Toracocentesis", categoria: "Procedimientos" },
};

// Función para buscar un procedimiento por código CUPS
export function buscarProcedimientoPorCodigo(codigo: string): ProcedimientoCUPS | null {
  const codigoLimpio = codigo.trim().replace(/\D/g, ""); // Remover caracteres no numéricos
  return CUPS_DATABASE[codigoLimpio] || null;
}

// Función para buscar códigos CUPS por nombre de procedimiento
export function buscarCodigosPorNombre(nombre: string): Array<{ codigo: string; nombre: string; categoria: string }> {
  const nombreLower = nombre.toLowerCase();
  const resultados: Array<{ codigo: string; nombre: string; categoria: string }> = [];

  for (const [codigo, procedimiento] of Object.entries(CUPS_DATABASE)) {
    if (procedimiento.nombre.toLowerCase().includes(nombreLower)) {
      resultados.push({ codigo, nombre: procedimiento.nombre, categoria: procedimiento.categoria });
    }
  }

  // Limitar a 10 resultados para mejor UX
  return resultados.slice(0, 10);
}

// Función para formatear código CUPS (agregar puntos para mejor legibilidad)
export function formatearCodigoCUPS(codigo: string): string {
  const codigoLimpio = codigo.trim().replace(/\D/g, "");
  if (codigoLimpio.length === 6) {
    return `${codigoLimpio.slice(0, 2)}.${codigoLimpio.slice(2, 4)}.${codigoLimpio.slice(4)}`;
  }
  return codigoLimpio;
}