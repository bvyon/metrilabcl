// JSON-LD: SOLO propiedades medidas (lista "procede" de NEXUS, MET-151 §3.1).
//
// Lo que deliberadamente NO se emite, y por que:
//   aggregateRating / review  0 resenas confirmadas por dos fuentes independientes.
//   isbn                      el unico observado pertenece a otro ASIN.
//   offers                    el precio medido caduca y el sitio no lo re-mide en cada visita.
//   workExample               el hermano en papel solo esta visto en amazon.es, sin crudo propio.
import type { Libro, Autor } from './catalogo'
import { SITIO, S } from './sitio'

type Miga = { name: string; url: string }

/** Quita las propiedades sin valor MEDIDO. Una propiedad ausente es una afirmacion que no se
 *  hace; una propiedad presente con un valor plausible es una mentira con datos estructurados. */
function sinVacios<T extends Record<string, unknown>>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null)) as Partial<T>
}

// BreadcrumbList: la jerarquia REAL de este sitio. El indice ES el catalogo, asi que su miga
// tiene un solo elemento — emitir "Inicio > Catalogo" con la misma URL dos veces seria
// declarar una jerarquia que no existe.
export function migajas(canonical: string, items: Miga[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  }
}

export function ldIndice(canonical: string, libros: Libro[], urlDe: (b: Libro) => string) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': canonical,
      url: canonical,
      name: SITIO.siteName,
      inLanguage: SITIO.siteLang,
      // El ASIN va en cada hasPart para que una verificacion externa pueda cruzar nodo por
      // nodo contra el catalogo medido; sin identificador, el nodo no es comprobable (§3.1).
      hasPart: libros.map((b) =>
        sinVacios({
          '@type': 'Book',
          '@id': urlDe(b),
          url: urlDe(b),
          name: b.title,
          // Ausente en la ficha declarada: su idioma no se ha medido. Un nodo con menos
          // propiedades es correcto; uno con una propiedad inventada, no.
          inLanguage: b.languageCode,
          identifier: [{ '@type': 'PropertyValue', propertyID: 'ASIN', value: b.asin }],
          sameAs: b.amazonUrl,
        }),
      ),
    },
    migajas(canonical, [{ name: S.migaCatalogo, url: canonical }]),
  ]
}

export function ldFicha(canonical: string, b: Libro, urlIndice: string) {
  return [
    sinVacios({
      '@context': 'https://schema.org',
      '@type': 'Book',
      '@id': canonical,
      url: canonical,
      name: b.title,
      // Forma literal del byline de ESTA ficha: NEXUS §3.1 pide no normalizar entre fichas.
      author: { '@type': 'Person', name: b.author },
      // Las cuatro siguientes SOLO existen si se leyeron de la pagina del producto. En la ficha
      // declarada (MET-166) no hay ninguna, y el nodo se emite sin ellas: un Book sin
      // numberOfPages es correcto, uno con un numero plausible es el pasivo que no queremos.
      bookFormat: b.format ? 'https://schema.org/EBook' : undefined,
      inLanguage: b.languageCode,
      numberOfPages: b.printLength,
      datePublished: b.publicationDate,
      identifier: [{ '@type': 'PropertyValue', propertyID: 'ASIN', value: b.asin }],
      sameAs: b.amazonUrl,
      isPartOf: { '@type': 'CollectionPage', '@id': urlIndice },
    }),
    migajas(canonical, [
      { name: S.migaCatalogo, url: urlIndice },
      { name: b.title, url: canonical },
    ]),
  ]
}

// Person con las formas medidas del nombre y sameAs SOLO hacia los perfiles que respondieron
// al comprobarlos (NEXUS §3.1 y condicion de citabilidad 4). Sin Organization: no existe una
// entidad recuperable con datos de contacto reales (§3.2).
export function ldAutor(canonical: string, a: Autor, urlIndice: string) {
  const person: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${canonical}#person`,
    url: canonical,
    name: a.primaryName,
    mainEntityOfPage: canonical,
  }
  if (a.alternateNames?.length) {
    person.alternateName = a.alternateNames.length === 1 ? a.alternateNames[0] : a.alternateNames
  }
  person.sameAs = a.sameAs.map((s) => s.url)

  return [
    person,
    migajas(canonical, [
      { name: S.migaCatalogo, url: urlIndice },
      { name: a.primaryName, url: canonical },
    ]),
  ]
}
