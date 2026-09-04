import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, ArrowRight } from 'lucide-react';
import { PANEL, CARD, BORDER, BORDER_SOFT, TEXT, MUTED, DIM, AMBER, SANS, MONO } from './darkKit';

/* ── Punto de entrada al generador ───────────────────────────────
   El generador lleva desde siempre en el menú y casi nadie lo usa:
   de 40 personas que lo tienen pagado, 16 lo han abierto alguna vez.
   El problema no es que falte el enlace, es que solo se menciona en
   los muros de pago — o sea, a quien NO lo tiene.

   Este bloque se coloca en los momentos en los que la intención ya
   existe (una búsqueda sin resultados, el final de un prompt que casi
   encaja), en vez de interrumpir con un aviso. */

type Props = {
    /** 'search' se usa cuando una búsqueda no devolvió nada. */
    variant?: 'search' | 'inline';
    /** El término buscado, para nombrarlo literalmente. */
    query?: string;
    /** Contexto para saber por dónde entra la gente. */
    from?: string;
};

const GeneratorCallout: React.FC<Props> = ({ variant = 'inline', query, from }) => {
    const isSearch = variant === 'search';
    const to = `/generador${from ? `?from=${encodeURIComponent(from)}` : ''}`;

    const title = isSearch && query
        ? `No hay ningún prompt para «${query}»`
        : isSearch
            ? 'No hay ningún prompt que encaje'
            : '¿Necesitas uno hecho a tu medida?';

    const body = isSearch
        ? 'Descríbelo en una frase y el generador te escribe uno a medida, con el mismo formato que los del catálogo.'
        : 'Si este casi te sirve pero no del todo, descríbele tu caso al generador y te escribe la versión que necesitas.';

    return (
        <div
            style={{
                backgroundColor: CARD,
                border: `1px solid ${BORDER_SOFT}`,
                borderRadius: 14,
                padding: isSearch ? '26px 24px' : '20px 22px',
                textAlign: isSearch ? 'center' : 'left',
                fontFamily: SANS,
            }}
        >
            <div
                className={isSearch ? 'mx-auto' : ''}
                style={{
                    width: 38, height: 38, borderRadius: 11, marginBottom: 14,
                    backgroundColor: 'rgba(255,178,36,0.09)',
                    border: '1px solid rgba(255,178,36,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <Wand2 size={17} style={{ color: AMBER }} />
            </div>

            <p style={{
                fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: DIM, marginBottom: 8,
            }}>
                Generador con IA
            </p>

            <p style={{
                fontSize: 16, fontWeight: 700, color: TEXT,
                letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1.35,
            }}>
                {title}
            </p>

            <p style={{
                fontSize: 13.5, color: MUTED, lineHeight: 1.7,
                marginBottom: 18, maxWidth: isSearch ? 420 : undefined,
                marginLeft: isSearch ? 'auto' : undefined,
                marginRight: isSearch ? 'auto' : undefined,
            }}>
                {body}
            </p>

            <Link
                to={to}
                className="inline-flex items-center gap-2"
                style={{
                    backgroundColor: TEXT, color: '#000',
                    fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
                    borderRadius: 10, padding: '11px 20px',
                }}
            >
                Crear mi prompt <ArrowRight size={14} />
            </Link>

            <p style={{ fontSize: 11.5, color: DIM, marginTop: 12 }}>
                Incluido en tu plan · hasta 10 al día
            </p>
        </div>
    );
};

export default GeneratorCallout;
