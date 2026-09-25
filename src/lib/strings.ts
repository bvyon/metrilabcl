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

export const STRINGS = {
  es: {
    fecha: (y, m, d) => `${d} de ${MESES_ES[m - 1]} de ${y}`,
    skip: 'Saltar al contenido',
    rutaLabel: 'Ruta',
    migaCatalogo: 'Catálogo',
    piePublisher: (p) => `${p}. Catálogo de títulos autopublicados en Amazon Kindle.`,
    pieNota: 'Cada dato de este sitio sale de la página pública del título en Amazon y lleva la ' +
      'fecha en que se midió. Lo que no se ha medido se declara como no medido, no se estima.',
    pieGenerado: (f) => `Página generada el ${f}.`,

    titulosCuenta: (n) => (n === 1 ? '1 título' : `${n} títulos`),
    indiceTitulo: (nombre, titulos) => `${nombre} — catálogo con ${titulos}`,
    indiceDescripcion: (publisher, titulos) =>
      `Catálogo de los ebooks de ${publisher} en Amazon Kindle: ${titulos} con ASIN, idioma, ` +
      'extensión y fecha de publicación medidos en la página del producto.',
    indiceEntrada: (publisher) =>
      `Ficha de datos de cada título autopublicado por ${publisher} en Amazon Kindle. Los valores de ` +
      'esta página se leyeron de la página pública del producto en Amazon en la fecha indicada en cada ' +
      'ficha; no hay reseñas, valoraciones ni posiciones de venta porque no se han medido.',
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
    paginas: (n) => `${n} páginas`,
    precioNota: '(precio de compra en amazon.com al momento de la medición; puede haber cambiado)',
    medidoEl: (f) => `Datos medidos el ${f}.`,

    fichaTitulo: (t, asin) => `${t} — ficha de datos (ASIN ${asin})`,
    fichaDescripcion: (corto, autor, formato, paginas, idioma, fecha, asin, medido) =>
      `«${corto}» de ${autor}: ${formato}, ${paginas} páginas, ${idioma}, publicado el ${fecha}. ` +
      `ASIN ${asin}. Medido el ${medido}.`,
    fichaEntrada: (autor) =>
      `Título de ${autor} publicado en Amazon Kindle. Todo lo que sigue se leyó de la página pública ` +
      'del producto; nada está estimado.',
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
      `${n} título(s) corroborados por al menos dos métodos independientes. Los que tienen ficha en este ` +
      'catálogo son los que se pudieron medir en su página de Amazon; el resto se nombra sin datos ' +
      'porque su ficha no se pudo leer.',
    autorConFicha: 'con ficha en este catálogo',
    autorSinFicha: 'sin ficha: su página de Amazon no se pudo medir',
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
    pieNota: 'Every value on this site was read from the title’s public Amazon product page and ' +
      'carries the date it was measured. Anything not measured is declared as not measured, never estimated.',
    pieGenerado: (f) => `Page generated on ${f}.`,

    titulosCuenta: (n) => (n === 1 ? '1 title' : `${n} titles`),
    indiceTitulo: (nombre, titulos) => `${nombre} — catalog of ${titulos}`,
    indiceDescripcion: (publisher, titulos) =>
      `Catalog of the ${publisher} ebooks on Amazon Kindle: ${titulos} with ASIN, language, length ` +
      'and publication date read from the product page.',
    indiceEntrada: (publisher) =>
      `A data sheet for every title self-published by ${publisher} on Amazon Kindle. The values on this ` +
      'page were read from the public Amazon product page on the date shown on each card; there are no ' +
      'reviews, ratings or sales ranks here because none have been measured.',
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
    paginas: (n) => `${n} pages`,
    precioNota: '(purchase price on amazon.com at the time of measurement; it may have changed since)',
    medidoEl: (f) => `Data measured on ${f}.`,

    fichaTitulo: (t, asin) => `${t} — data sheet (ASIN ${asin})`,
    fichaDescripcion: (corto, autor, formato, paginas, idioma, fecha, asin, medido) =>
      `“${corto}” by ${autor}: ${formato}, ${paginas} pages, ${idioma}, published ${fecha}. ` +
      `ASIN ${asin}. Measured on ${medido}.`,
    fichaEntrada: (autor) =>
      `A title by ${autor} published on Amazon Kindle. Everything below was read from the public ` +
      'product page; nothing is estimated.',
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
      `${n} title(s) corroborated by at least two independent methods. The ones with a data sheet in ` +
      'this catalog are the ones whose Amazon page could be measured; the rest are named without data ' +
      'because their listing could not be read.',
    autorConFicha: 'data sheet in this catalog',
    autorSinFicha: 'no data sheet: its Amazon listing could not be measured',
    autorH2Perfiles: 'Verified external profiles',
    autorPerfilesIntro:
      'Only profiles that exist and answered when checked are linked here, with the time of the check.',
    autorVerificado: (f, quien) => `checked on ${f} by ${quien}`,
    autorH2NoEncontrado: 'What does not exist, or was not found',
    autorH2Procedencia: 'Provenance of this page',
  },
}
