// Cadenas de la plantilla por idioma del sitio (siteLang de src/lib/sitio.ts).
//
// Por que existe este archivo: RADAR (MET-150) midio que la demanda del contenido tipo
// guia esta en ingles y que en espanol no hay demanda equivalente para ese angulo; FORJA
// (MET-152 §6, §7 accion 2) especifico que el chrome del sitio pase a ingles manteniendo
// Book.inLanguage fiel a lo que declara cada ficha de Amazon. Dejar las dos tablas hace
// que volver atras sea una linea en src/lib/sitio.ts, no una reescritura.
//
// Regla: si siteLang no tiene tabla, el build muere. Un sitio a medio traducir es peor que
// uno en el idioma equivocado, porque el fallo no se ve.

const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MESES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December']

/** Contrato de una tabla de cadenas. Anotar STRINGS con esto tipa por contexto cada funcion
 *  de las tablas: si una tabla olvida una clave o le cambia la aridad, falla `astro check`. */
export interface Tabla {
  fecha: (y: number, m: number, d: number) => string
  skip: string
  rutaLabel: string
  migaCatalogo: string
  piePublisher: (p: string) => string
  pieNota: string
  pieGenerado: (f: string) => string
  titulosCuenta: (n: number) => string
  indiceTitulo: (nombre: string, titulos: string) => string
  indiceDescripcion: (publisher: string, titulos: string) => string
  indiceEntrada: (publisher: string) => string
  indiceCatalogo: (titulos: string) => string
  indiceAutorH2: string
  indiceAutorTexto: (nombre: string) => string
  indiceAutorEnlace: string
  dtAutor: string
  dtFormato: string
  dtIdioma: string
  dtExtension: string
  dtPublicado: string
  dtFechaPublicacion: string
  dtAsin: string
  dtPeso: string
  dtPrecio: string
  /** Etiqueta neutra del precio en una ficha declarada: alli no hay medicion que calificar. */
  dtPrecioNeutro: string
  paginas: (n: number) => string
  precioNota: string
  medidoEl: (f: string) => string
  /** Marca de valor ausente. Un dato que no se midio se DICE, no se omite en silencio. */
  noMedido: string
  declaradoEl: (f: string) => string
  fichaTitulo: (t: string, asin: string) => string
  fichaDescripcion: (corto: string, autor: string, formato: string, paginas: number, idioma: string, fecha: string, asin: string, medido: string) => string
  fichaDescripcionDeclarada: (corto: string, autor: string, asin: string, declarado: string) => string
  fichaEntrada: (autor: string) => string
  fichaEntradaDeclarada: (autor: string) => string
  fichaAvisoDeclarada: string
  h2Datos: string
  h2Procedencia: string
  h2NoMedido: string
  h2Anomalias: string
  h2Demanda: string
  h2OtrasEdiciones: string
  h2MasDelAutor: string
  cta: string
  dtFuente: string
  dtMedidoEl: string
  dtMedidoPor: string
  dtMetodo: string
  dtReverificado: string
  dtDeclaradoEl: string
  dtDeclaradoPor: string
  dtDeclaraQue: string
  demandaIntro: (etiqueta: string, fecha: string) => string
  demandaAviso: string
  demandaFuente: (url: string) => string
  masDelAutorTexto: (nombre: string) => string
  /** `enlace` es HTML ya construido: la plantilla lo inserta con set:html. */
  masDelAutorSinOtros: (nombre: string, enlace: string) => string
  verPaginaAutor: string
  p404Titulo: string
  p404Entrada: string
  p404Enlace: string
  p404Head: (nombre: string) => string
  p404Desc: string
  autorTitulo: (nombre: string, sitio: string) => string
  autorDescripcion: (nombre: string, n: number) => string
  autorEntrada: (nombre: string) => string
  autorH2Nombres: string
  autorNombresIntro: string
  autorThForma: string
  autorThFuente: string
  autorThMedido: string
  autorH2Titulos: string
  autorTitulosIntro: (n: number) => string
  autorConFicha: string
  autorFichaDeclarada: string
  autorSinFicha: string
  autorH2Perfiles: string
  autorPerfilesIntro: string
  autorVerificado: (f: string, quien: string) => string
  autorH2NoEncontrado: string
  autorH2Procedencia: string
}

export const STRINGS: Record<'es' | 'en', Tabla> = {
  es: {
    fecha: (y, m, d) => `${d} de ${MESES_ES[m - 1]} de ${y}`,
    skip: 'Saltar al contenido',
    rutaLabel: 'Ruta',
    migaCatalogo: 'Catálogo',
    piePublisher: (p) => `${p}. Catálogo de títulos autopublicados en Amazon Kindle.`,
    pieNota: 'Cada dato de este sitio sale de la página pública del título en Amazon y lleva la fecha ' +
      'en que se midió, o bien lleva escrito de dónde sale si no es una medición nuestra. Lo que no se ' +
      'ha medido se declara como no medido, no se estima.',
    pieGenerado: (f) => `Página generada el ${f}.`,

    titulosCuenta: (n) => (n === 1 ? '1 título' : `${n} títulos`),
    indiceTitulo: (nombre, titulos) => `${nombre} — catálogo con ${titulos}`,
    indiceDescripcion: (publisher, titulos) =>
      `Catálogo de los ebooks de ${publisher} en Amazon Kindle: ${titulos} con ASIN, idioma, ` +
      'extensión y fecha de publicación medidos en la página del producto.',
    indiceEntrada: (publisher) =>
      `Ficha de datos de cada título autopublicado por ${publisher} en Amazon Kindle. Los valores de ` +
      'esta página se leyeron de la página pública del producto en Amazon en la fecha indicada en cada ' +
      'ficha, salvo donde la propia ficha dice que el dato no está medido; no hay reseñas, valoraciones ' +
      'ni posiciones de venta porque no se han medido.',
    indiceCatalogo: (titulos) => `Catálogo (${titulos})`,
    indiceAutorH2: 'Quién publica estos títulos',
    indiceAutorTexto: (nombre) =>
      `Los títulos de este catálogo están firmados por ${nombre} en Amazon. La página de entidad reúne ` +
      'las formas del nombre medidas en cada fuente y los perfiles verificados.',
    indiceAutorEnlace: 'Ver la página del autor',

    dtAutor: 'Autor',
    dtFormato: 'Formato',
    dtIdioma: 'Idioma',
    dtExtension: 'Extensión',
    dtPublicado: 'Publicado',
    dtFechaPublicacion: 'Fecha de publicación',
    dtAsin: 'ASIN',
    dtPeso: 'Tamaño del archivo',
    dtPrecio: 'Precio medido',
    dtPrecioNeutro: 'Precio',
    paginas: (n) => `${n} páginas`,
    precioNota: '(precio de compra en amazon.com al momento de la medición; puede haber cambiado)',
    medidoEl: (f) => `Datos medidos el ${f}.`,
    noMedido: 'no medido',
    declaradoEl: (f) => `Título declarado el ${f}. Ningún dato de este título está medido.`,

    fichaTitulo: (t, asin) => `${t} — ficha de datos (ASIN ${asin})`,
    fichaDescripcion: (corto, autor, formato, paginas, idioma, fecha, asin, medido) =>
      `«${corto}» de ${autor}: ${formato}, ${paginas} páginas, ${idioma}, publicado el ${fecha}. ` +
      `ASIN ${asin}. Medido el ${medido}.`,
    fichaDescripcionDeclarada: (corto, autor, asin, declarado) =>
      `«${corto}» de ${autor}, ASIN ${asin}. Título declarado por escrito por el propietario del ` +
      `catálogo el ${declarado}. Su página de Amazon nunca se pudo leer: ningún otro dato de este ` +
      'título está medido, y esta ficha no publica ninguno.',
    fichaEntrada: (autor) =>
      `Título de ${autor} publicado en Amazon Kindle. Todo lo que sigue se leyó de la página pública ` +
      'del producto; nada está estimado.',
    // Sin "en Amazon Kindle": el formato de este título tampoco está medido.
    fichaEntradaDeclarada: (autor) =>
      `Título atribuido a ${autor} por el propietario de este catálogo. A diferencia del resto del ` +
      'catálogo, esta ficha no sale de una medición nuestra: la página de Amazon de este ASIN nunca se ' +
      'ha podido leer.',
    fichaAvisoDeclarada:
      'Lo único que esta página afirma es lo que el propietario del catálogo declaró por escrito, y se ' +
      'nombra debajo. Los campos marcados como no medidos están vacíos porque no se midieron, no porque ' +
      'no existan: aparecerán el día en que la página del producto se pueda leer, y no antes.',
    h2Datos: 'Datos del título',
    h2Procedencia: 'Procedencia de estos datos',
    h2NoMedido: 'No medido',
    h2Anomalias: 'Anomalías de la ficha en Amazon',
    h2Demanda: 'Qué pregunta la gente sobre este tema',
    h2OtrasEdiciones: 'Otras ediciones vistas',
    h2MasDelAutor: 'Más títulos del mismo autor',
    cta: 'Ver el título en Amazon',

    dtFuente: 'Fuente',
    dtMedidoEl: 'Medido el',
    dtMedidoPor: 'Medido por',
    dtMetodo: 'Método',
    dtReverificado: 'Re-verificado el',
    dtDeclaradoEl: 'Declarado el',
    dtDeclaradoPor: 'Declarado por',
    dtDeclaraQue: 'Qué cubre la declaración',

    demandaIntro: (etiqueta, fecha) =>
      `Preguntas reales sobre este tema, citadas literalmente de ${etiqueta}, leída el ${fecha}.`,
    demandaAviso:
      'Estas preguntas no salen de este libro ni de su ficha en Amazon: salen de una página pública ' +
      'sobre el mismo tema. Nadie de MetrilabCL ha leído el interior del libro, así que no se afirma ' +
      'que el libro las responda. Están aquí como contexto de compra, no como índice de contenidos.',
    demandaFuente: (url) => `Fuente: ${url}`,
    masDelAutorTexto: (nombre) => `Otros títulos de ${nombre} con ficha en este catálogo:`,
    masDelAutorSinOtros: (nombre, enlace) =>
      `Es el único título de ${nombre} con ficha en este catálogo. El resto del catálogo conocido está ` +
      `en ${enlace}.`,
    verPaginaAutor: 'la página del autor',

    p404Titulo: 'Esta página no existe',
    p404Entrada: 'La dirección que pediste no corresponde a ninguna ficha de este catálogo.',
    p404Enlace: 'Ir al catálogo',
    p404Head: (nombre) => `Página no encontrada — ${nombre}`,
    p404Desc: 'La dirección pedida no corresponde a ninguna ficha de este catálogo.',

    autorTitulo: (nombre, sitio) => `${nombre} — autor del catálogo de ${sitio}`,
    autorDescripcion: (nombre, n) =>
      `Quién firma los ebooks de ${nombre} en Amazon Kindle: formas del nombre medidas en cada fuente, ` +
      `${n} título(s) conocidos y los perfiles externos verificados. Sin biografía inventada.`,
    autorEntrada: (nombre) =>
      `Página de entidad de ${nombre}, el nombre bajo el que se publican los títulos de este catálogo. ` +
      'Todo lo de esta página está medido en una fuente pública y citado con su fecha; lo que no se ' +
      'encontró se declara como no encontrado.',
    autorH2Nombres: 'El nombre, tal como lo escribe cada fuente',
    autorNombresIntro:
      'El nombre no es idéntico entre las fuentes medidas. Se publican las dos formas en vez de elegir ' +
      'una y ocultar la otra: la inconsistencia está en el origen, no aquí.',
    autorThForma: 'Forma del nombre',
    autorThFuente: 'Fuente',
    autorThMedido: 'Medido',
    autorH2Titulos: 'Títulos publicados bajo este nombre',
    autorTitulosIntro: (n) =>
      `${n} título(s) conocidos bajo este nombre, cada uno con la fuente en la que se corroboró. Tener ` +
      'ficha en este catálogo no significa que el libro esté medido: cada ficha dice en su propia página ' +
      'si sus campos se leyeron de la página de Amazon o si sólo hay un título declarado por escrito.',
    autorConFicha: 'con ficha en este catálogo',
    autorFichaDeclarada: 'con ficha en este catálogo, pero sin ningún campo medido',
    autorSinFicha: 'sin ficha: no se ha leído ninguna página de Amazon de este título',
    autorH2Perfiles: 'Perfiles externos verificados',
    autorPerfilesIntro:
      'Sólo se enlazan perfiles que existen y respondieron al comprobarlos, con la hora de la comprobación.',
    autorVerificado: (f, quien) => `comprobado el ${f} por ${quien}`,
    autorH2NoEncontrado: 'Lo que no existe o no se encontró',
    autorH2Procedencia: 'Procedencia de esta página',
  },

  en: {
    fecha: (y, m, d) => `${MESES_EN[m - 1]} ${d}, ${y}`,
    skip: 'Skip to content',
    rutaLabel: 'Breadcrumb',
    migaCatalogo: 'Catalog',
    piePublisher: (p) => `${p}. Catalog of titles self-published on Amazon Kindle.`,
    pieNota: 'Every value on this site was either read from the title’s public Amazon product page, with ' +
      'the date it was measured, or carries in writing where it comes from when it is not a measurement ' +
      'of ours. Anything not measured is declared as not measured, never estimated.',
    pieGenerado: (f) => `Page generated on ${f}.`,

    titulosCuenta: (n) => (n === 1 ? '1 title' : `${n} titles`),
    indiceTitulo: (nombre, titulos) => `${nombre} — catalog of ${titulos}`,
    indiceDescripcion: (publisher, titulos) =>
      `Catalog of the ${publisher} ebooks on Amazon Kindle: ${titulos} with ASIN, language, length ` +
      'and publication date read from the product page.',
    indiceEntrada: (publisher) =>
      `A data sheet for every title self-published by ${publisher} on Amazon Kindle. The values on this ` +
      'page were read from the public Amazon product page on the date shown on each card, except where ' +
      'the card itself says the field was not measured; there are no reviews, ratings or sales ranks ' +
      'here because none have been measured.',
    indiceCatalogo: (titulos) => `Catalog (${titulos})`,
    indiceAutorH2: 'Who publishes these titles',
    indiceAutorTexto: (nombre) =>
      `The titles in this catalog are signed ${nombre} on Amazon. The entity page collects the name ` +
      'forms measured in each source and the profiles that were verified.',
    indiceAutorEnlace: 'Go to the author page',

    dtAutor: 'Author',
    dtFormato: 'Format',
    dtIdioma: 'Language',
    dtExtension: 'Length',
    dtPublicado: 'Published',
    dtFechaPublicacion: 'Publication date',
    dtAsin: 'ASIN',
    dtPeso: 'File size',
    dtPrecio: 'Measured price',
    dtPrecioNeutro: 'Price',
    paginas: (n) => `${n} pages`,
    precioNota: '(purchase price on amazon.com at the time of measurement; it may have changed since)',
    medidoEl: (f) => `Data measured on ${f}.`,
    noMedido: 'not measured',
    declaradoEl: (f) => `Title declared on ${f}. No field of this title has been measured.`,

    fichaTitulo: (t, asin) => `${t} — data sheet (ASIN ${asin})`,
    fichaDescripcion: (corto, autor, formato, paginas, idioma, fecha, asin, medido) =>
      `“${corto}” by ${autor}: ${formato}, ${paginas} pages, ${idioma}, published ${fecha}. ` +
      `ASIN ${asin}. Measured on ${medido}.`,
    fichaDescripcionDeclarada: (corto, autor, asin, declarado) =>
      `“${corto}” by ${autor}, ASIN ${asin}. The title was declared in writing by the owner of this ` +
      `catalog on ${declarado}. Its Amazon page has never been readable: no other field of this title ` +
      'is measured, and this sheet publishes none.',
    fichaEntrada: (autor) =>
      `A title by ${autor} published on Amazon Kindle. Everything below was read from the public ` +
      'product page; nothing is estimated.',
    // No "on Amazon Kindle": the format of this title is not measured either.
    fichaEntradaDeclarada: (autor) =>
      `A title attributed to ${autor} by the owner of this catalog. Unlike the rest of this catalog, ` +
      'this sheet does not come from a measurement of ours: the Amazon page of this ASIN has never been ' +
      'readable.',
    fichaAvisoDeclarada:
      'The only thing this page asserts is what the owner of this catalog declared in writing, named ' +
      'below. The fields marked as not measured are empty because they were not measured, not because ' +
      'they do not exist: they will appear the day the product page can be read, and not before.',
    h2Datos: 'Title data',
    h2Procedencia: 'Provenance of these data',
    h2NoMedido: 'Not measured',
    h2Anomalias: 'Anomalies in the Amazon listing',
    h2Demanda: 'What people actually ask about this topic',
    h2OtrasEdiciones: 'Other editions seen',
    h2MasDelAutor: 'More titles by the same author',
    cta: 'View this title on Amazon',

    dtFuente: 'Source',
    dtMedidoEl: 'Measured on',
    dtMedidoPor: 'Measured by',
    dtMetodo: 'Method',
    dtReverificado: 'Re-verified on',
    dtDeclaradoEl: 'Declared on',
    dtDeclaradoPor: 'Declared by',
    dtDeclaraQue: 'What the declaration covers',

    demandaIntro: (etiqueta, fecha) =>
      `Real questions about this topic, quoted verbatim from ${etiqueta}, read on ${fecha}.`,
    demandaAviso:
      'These questions do not come from this book or from its Amazon listing: they come from a public ' +
      'page about the same topic. Nobody at MetrilabCL has read the inside of the book, so no claim is ' +
      'made that the book answers them. They are here as buying context, not as a table of contents.',
    demandaFuente: (url) => `Source: ${url}`,
    masDelAutorTexto: (nombre) => `Other titles by ${nombre} with a data sheet in this catalog:`,
    masDelAutorSinOtros: (nombre, enlace) =>
      `This is the only title by ${nombre} with a data sheet in this catalog. The rest of the known ` +
      `catalog is listed on ${enlace}.`,
    verPaginaAutor: 'the author page',

    p404Titulo: 'This page does not exist',
    p404Entrada: 'The address you asked for does not match any data sheet in this catalog.',
    p404Enlace: 'Go to the catalog',
    p404Head: (nombre) => `Page not found — ${nombre}`,
    p404Desc: 'The requested address does not match any data sheet in this catalog.',

    autorTitulo: (nombre, sitio) => `${nombre} — author of the ${sitio} catalog`,
    autorDescripcion: (nombre, n) =>
      `Who signs these Amazon Kindle ebooks: the name forms ${nombre} is written with in each ` +
      `measured source, ${n} known titles, and the profiles that were verified.`,
    autorEntrada: (nombre) =>
      `Entity page for ${nombre}, the name the titles in this catalog are published under. Everything ` +
      'here was measured in a public source and is cited with its date; whatever was not found is ' +
      'declared as not found.',
    autorH2Nombres: 'The name, as each source writes it',
    autorNombresIntro:
      'The name is not identical across the measured sources. Both forms are published instead of ' +
      'picking one and hiding the other: the inconsistency is at the origin, not here.',
    autorThForma: 'Name form',
    autorThFuente: 'Source',
    autorThMedido: 'Measured',
    autorH2Titulos: 'Titles published under this name',
    autorTitulosIntro: (n) =>
      `${n} title(s) known under this name, each with the source it was corroborated in. Having a data ` +
      'sheet in this catalog does not mean the book was measured: every sheet states on its own page ' +
      'whether its fields were read from the Amazon listing or whether only a declared title exists.',
    autorConFicha: 'data sheet in this catalog',
    autorFichaDeclarada: 'data sheet in this catalog, with no measured field at all',
    autorSinFicha: 'no data sheet: no Amazon listing of this title has been read',
    autorH2Perfiles: 'Verified external profiles',
    autorPerfilesIntro:
      'Only profiles that exist and answered when checked are linked here, with the time of the check.',
    autorVerificado: (f, quien) => `checked on ${f} by ${quien}`,
    autorH2NoEncontrado: 'What does not exist, or was not found',
    autorH2Procedencia: 'Provenance of this page',
  },
}
