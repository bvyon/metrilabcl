import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// El esquema es la regla de la casa hecha codigo: **un campo que no esta aqui no se puede
// publicar**. Por eso cada objeto es `.strict()` — si alguien agrega "aggregateRating",
// "ratingValue", "reviewCount", "bestseller" o "award" a un JSON del catalogo, el build muere
// con el nombre del campo en el mensaje, en vez de publicarlo. No hay campos de valoracion,
// ranking ni premios en ningun nivel de este esquema, y es deliberado: no hemos medido
// ninguno. (NEXUS MET-151 §3.1 — solo se emite lo que procede de una medicion.)

const medicion = z
  .object({
    measuredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'ISO-8601 UTC (YYYY-MM-DDTHH:MM:SSZ)'),
    source: z.string().min(1),
    sourceUrl: z.string().url(),
    method: z.string().min(1),
    measuredBy: z.string().min(1),
    // Re-extraccion independiente del mismo crudo: si existe, la ficha la publica.
    verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/).optional(),
    verifiedBy: z.string().min(1).optional(),
    evidenceFile: z.string().min(1).optional(),
  })
  .strict()

const bcp47 = z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'BCP-47 corto, p.ej. "en" o "es-CL"')

const libros = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/libros' }),
  schema: z
    .object({
      // El id de la entrada (nombre del archivo) es el slug y es la URL. Se declara igual en
      // el JSON para que un desajuste se vea: lo comprueba src/lib/catalogo.ts.
      slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'URL limpia: [a-z0-9] separado por guiones'),
      title: z.string().min(1),
      author: z.string().min(1),
      asin: z.string().regex(/^[A-Z0-9]{10}$/, '10 caracteres [A-Z0-9]'),
      amazonUrl: z.string().url(),
      format: z.string().min(1),
      language: z.string().min(1),
      languageCode: bcp47,
      // Idioma del TEXTO del titulo cuando no coincide con el idioma declarado del libro.
      // Caso real medido: B0HDPV63R4 declara Language=Spanish con el titulo en ingles.
      // inLanguage describe el libro; el atributo lang del titulo describe ese texto.
      titleLanguageCode: bcp47.optional(),
      printLength: z.number().int().positive('paginas medidas, entero positivo'),
      publicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
      publicationDateLabel: z.string().min(1),
      fileSize: z.string().min(1).optional(),
      price: z
        .object({
          // En Amazon un 0.00 suele ser el icono de Kindle Unlimited, no el precio de compra.
          amount: z.string().regex(/^\d+\.\d{2}$/).refine((v) => Number(v) > 0, {
            message: 'price.amount es 0.00 — en Amazon ese cero suele ser el icono de Kindle Unlimited, ' +
              'no el precio de compra. Vuelve a medirlo en vez de publicar un libro gratis que no lo es.',
          }),
          currency: z.string().regex(/^[A-Z]{3}$/),
        })
        .strict()
        .optional(),
      // Lo que NO se midio se declara. Una seccion vacia no se publica: o hay contenido o no
      // existe el campo.
      notMeasured: z.array(z.string().min(1)).nonempty().optional(),
      // Anomalias de la propia ficha de Amazon: se reportan, no se corrigen ni se esconden.
      observations: z.array(z.string().min(1)).nonempty().optional(),
      demandContext: z
        .object({
          questions: z.array(z.string().min(1)).nonempty(),
          questionsLang: bcp47,
          notes: z.array(z.string().min(1)).nonempty().optional(),
          // Sin fuente citable no se publica una pregunta.
          source: z
            .object({
              url: z.string().url(),
              label: z.string().min(1),
              readAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
              readBy: z.string().min(1),
              method: z.string().min(1),
            })
            .strict(),
        })
        .strict()
        .optional(),
      relatedEditions: z
        .array(
          z
            .object({
              asin: z.string().regex(/^[A-Z0-9]{10}$/),
              format: z.string().min(1),
              storefront: z.string().min(1),
              url: z.string().url(),
              confidence: z.string().min(1),
              note: z.string().min(1),
            })
            .strict(),
        )
        .nonempty()
        .optional(),
      measurement: medicion,
    })
    .strict()
    .refine((b) => b.amazonUrl.includes(b.asin), {
      message: 'amazonUrl no contiene el ASIN de la ficha',
      path: ['amazonUrl'],
    })
    .refine(
      (b) => !b.relatedEditions || b.relatedEditions.every((e) => e.url.includes(e.asin)),
      { message: 'alguna relatedEditions[].url no contiene su propio ASIN', path: ['relatedEditions'] },
    ),
})

// La entidad del autor es parte del sitio, no un extra opcional: NEXUS (MET-151 §1) midio con
// cuatro metodos independientes que no existe biografia ni perfil social recuperable. La
// pagina lo DECLARA en vez de rellenarlo, y por eso `notFound` es obligatorio y no vacio: una
// pagina de autor sin biografia y sin decir por que es indistinguible de una a medio hacer.
const autor = defineCollection({
  loader: glob({ pattern: 'author.json', base: './src/data' }),
  schema: z
    .object({
      _comment: z.string().optional(),
      primaryName: z.string().min(1),
      alternateNames: z.array(z.string().min(1)).nonempty().optional(),
      // El nombre que se publica es una forma MEDIDA en una fuente, nunca una eleccion
      // editorial: src/lib/catalogo.ts comprueba que primaryName y alternateNames salgan de aqui.
      nameForms: z
        .array(z.object({ form: z.string().min(1), source: z.string().min(1), measuredBy: z.string().min(1) }).strict())
        .nonempty(),
      knownTitles: z
        .array(
          z
            .object({
              title: z.string().min(1),
              slug: z.string().nullable(),
              // Por que sabemos que existe.
              corroboration: z.string().min(1),
            })
            .strict(),
        )
        .nonempty(),
      // Un sameAs sin comprobacion fechada no se emite: es una afirmacion de identidad, no un
      // enlace suelto.
      sameAs: z
        .array(
          z
            .object({
              url: z.string().url(),
              label: z.string().min(1),
              verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
              verifiedBy: z.string().min(1),
            })
            .strict(),
        )
        .nonempty(),
      notFound: z.array(z.string().min(1)).nonempty(),
      measurement: medicion,
    })
    .strict(),
})

export const collections = { libros, autor }
