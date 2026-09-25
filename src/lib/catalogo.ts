// Carga del catalogo medido y los invariantes que NO caben en el esquema de una entrada
// suelta, porque cruzan varios archivos. Zod valida cada ficha por separado; esto valida el
// conjunto. Todo lo de aqui mata el build: un catalogo incoherente no se publica a medias.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { SITIO } from './sitio'

export type Libro = CollectionEntry<'libros'>['data']
export type Autor = CollectionEntry<'autor'>['data']

function morir(mensajes: string[]): never {
  throw new Error(`\nCATALOGO INVALIDO — ${mensajes.length} problema(s):\n` + mensajes.map((m) => `  - ${m}`).join('\n') + '\n')
}

export async function cargarLibros(): Promise<Libro[]> {
  const entradas = await getCollection('libros')
  if (!entradas.length) {
    morir(['src/data/libros/ no contiene ningun titulo. Un catalogo vacio no se publica en silencio.'])
  }

  const problemas: string[] = []
  for (const e of entradas) {
    // El nombre del archivo ES la URL. Si el campo slug y el archivo se separan, una ficha se
    // publica en una direccion y se declara en otra.
    if (e.data.slug !== e.id) {
      problemas.push(`src/data/libros/${e.id}.json: el slug "${e.data.slug}" no coincide con el nombre del archivo "${e.id}"`)
    }
    if (e.data.slug === SITIO.authorPathSegment) {
      problemas.push(`src/data/libros/${e.id}.json: el slug "${e.data.slug}" choca con authorPathSegment`)
    }
  }

  // slug, asin y title unicos. Los dos primeros porque son la identidad del producto; title
  // porque un duplicado rompe la unicidad de <title> y de la meta description.
  for (const clave of ['slug', 'asin', 'title'] as const) {
    const visto = new Map<string, string>()
    for (const e of entradas) {
      const v = e.data[clave]
      if (visto.has(v)) problemas.push(`${clave} duplicado "${v}" en ${visto.get(v)} y src/data/libros/${e.id}.json`)
      visto.set(v, `src/data/libros/${e.id}.json`)
    }
  }

  if (problemas.length) morir(problemas)
  return entradas.map((e) => e.data).sort((a, b) => a.slug.localeCompare(b.slug))
}

export async function cargarAutor(libros: Libro[]): Promise<Autor> {
  const entrada = await getEntry('autor', 'author')
  if (!entrada) {
    morir(['falta src/data/author.json — la pagina de entidad es parte de la fase 1, no un extra'])
  }
  const a = entrada.data
  const problemas: string[] = []

  // El nombre publicado tiene que ser una forma medida en una fuente, no una eleccion editorial.
  const formas = new Set(a.nameForms.map((n) => n.form))
  if (!formas.has(a.primaryName)) {
    problemas.push(`author.json: primaryName "${a.primaryName}" no aparece en nameForms`)
  }
  for (const alt of a.alternateNames ?? []) {
    if (!formas.has(alt)) problemas.push(`author.json: alternateNames "${alt}" no aparece en nameForms`)
  }

  const slugs = new Set(libros.map((b) => b.slug))
  for (const [i, t] of a.knownTitles.entries()) {
    if (t.slug !== null && !slugs.has(t.slug)) {
      problemas.push(`author.json: knownTitles[${i}].slug "${t.slug}" no corresponde a ningun archivo de src/data/libros/`)
    }
  }
  // La pagina de autor no puede omitir un titulo que el catalogo si publica.
  for (const b of libros) {
    if (!a.knownTitles.some((t) => t.slug === b.slug)) {
      problemas.push(`author.json: el titulo publicado "${b.slug}" no aparece en knownTitles`)
    }
  }

  if (problemas.length) morir(problemas)
  return a
}
