import { defineCollection } from 'astro:content'
import { z } from 'zod'
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

// Procedencia alternativa: un dato ENTREGADO POR ESCRITO por el propietario del catalogo.
// No es una medicion nuestra y no se cita como tal. Habilita SOLO los campos que la propia
// declaracion dice cubrir (`declares`); todo lo demas sigue prohibido exactamente igual que
// antes: se mide en la pagina de Amazon o no se publica. (Enmienda del Board, MET-166,
// 2026-09-25T13:48Z: un Book sin offers ni numberOfPages es correcto; uno con un precio
// inventado es el pasivo que este sitio existe para no tener.)
const declaracion = z
  .object({
    declaredAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, 'ISO-8601 UTC (YYYY-MM-DDTHH:MM:SSZ)'),
    declaredBy: z.string().min(1),
    source: z.string().min(1),
    method: z.string().min(1),
    // Que cubre la declaracion, campo por campo. Es lo que la pagina publica como alcance.
    declares: z.array(z.string().min(1)).nonempty(),
  })
  .strict()

// Lo que solo puede salir de la pagina de Amazon. Con `declaration` ninguno se admite; con
// `measurement`, los seis primeros son obligatorios.
const CAMPOS_DE_AMAZON = [
  'format', 'language', 'languageCode', 'printLength', 'publicationDate', 'publicationDateLabel',
  'titleLanguageCode', 'fileSize', 'price', 'demandContext', 'relatedEditions',
] as const
const CAMPOS_DE_AMAZON_OBLIGATORIOS = CAMPOS_DE_AMAZON.slice(0, 6)

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
      format: z.string().min(1).optional(),
      language: z.string().min(1).optional(),
      languageCode: bcp47.optional(),
      // Idioma del TEXTO del titulo cuando no coincide con el idioma declarado del libro.
      // Caso real medido: B0HDPV63R4 declara Language=Spanish con el titulo en ingles.
      // inLanguage describe el libro; el atributo lang del titulo describe ese texto.
      titleLanguageCode: bcp47.optional(),
      // Opcionales en el esquema plano, obligatorios en cuanto la ficha declara `measurement`:
      // lo exige el superRefine de abajo. La opcionalidad existe para la ficha declarada, que
      // no tiene ninguno de estos datos medidos, no para poder olvidar uno en una ficha medida.
      printLength: z.number().int().positive('paginas medidas, entero positivo').optional(),
      publicationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD').optional(),
      publicationDateLabel: z.string().min(1).optional(),
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
      // Exactamente una de las dos, nunca las dos ni ninguna: lo exige el superRefine.
      measurement: medicion.optional(),
      declaration: declaracion.optional(),
    })
    .strict()
    .superRefine((b, ctx) => {
      const presente = (k: string) => (b as Record<string, unknown>)[k] !== undefined

      if (Boolean(b.measurement) === Boolean(b.declaration)) {
        ctx.addIssue({
          code: 'custom',
          path: ['measurement'],
          message:
            'cada ficha lleva exactamente UNA procedencia: `measurement` (leida por nosotros de la ' +
            'pagina de Amazon) o `declaration` (entregada por escrito por el propietario del catalogo). ' +
            `Esta tiene ${b.measurement ? 'las dos' : 'ninguna'}.`,
        })
      }

      if (b.measurement) {
        for (const k of CAMPOS_DE_AMAZON_OBLIGATORIOS) {
          if (!presente(k)) {
            ctx.addIssue({
              code: 'custom',
              path: [k],
              message: `falta "${k}": una ficha con \`measurement\` publica los campos leidos de la pagina ` +
                'de Amazon, y este no esta. Si no se midio, la ficha no lleva `measurement`.',
            })
          }
        }
      }

      if (b.declaration) {
        for (const k of CAMPOS_DE_AMAZON) {
          if (presente(k)) {
            ctx.addIssue({
              code: 'custom',
              path: [k],
              message: `"${k}" no se puede publicar en una ficha declarada: la declaracion del propietario ` +
                `cubre ${b.declaration.declares.join(', ')} y nada mas. Ese dato se lee de la pagina de ` +
                'Amazon o no se publica — no se rellena con un valor plausible.',
            })
          }
        }
        if (!b.notMeasured) {
          ctx.addIssue({
            code: 'custom',
            path: ['notMeasured'],
            message: 'una ficha declarada tiene que DECIR en la pagina lo que no se midio: `notMeasured` ' +
              'es obligatorio aqui. Una ficha con tres datos y sin explicacion parece una a medio hacer.',
          })
        }
      }
    })
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
