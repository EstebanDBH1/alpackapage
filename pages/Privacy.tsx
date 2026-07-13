import React from 'react';
import { Link } from 'react-router-dom';

const Section: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="mb-12">
    <div className="flex items-baseline gap-3 mb-4">
      <span className="font-mono text-[10px] tracking-[0.2em] text-accent">{number}</span>
      <h2 className="text-base font-medium tracking-tight text-foreground">{title}</h2>
    </div>
    <div className="space-y-3 border-l border-border/60 pl-8 text-sm leading-relaxed text-muted-foreground">
      {children}
    </div>
  </div>
);

const Privacy: React.FC = () => {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background bg-radial-glow pb-24 font-space text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-star-field opacity-40"></div>

      <div className="relative">
      {/* Header */}
      <div className="border-b border-border/60 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_oklch(0.72_0.16_40)]"></span>
            <span>Documento legal</span>
          </div>
          <h1 className="mb-3 text-3xl font-medium leading-tight tracking-tight text-foreground md:text-4xl">
            Política de privacidad
          </h1>
          <p className="text-xs text-muted-foreground">
            Última actualización: 2 de marzo de 2026 · Versión 1.0
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Intro */}
        <div className="mb-12 rounded-2xl border border-border/70 bg-card p-6 text-sm leading-relaxed text-muted-foreground">
          En <strong className="font-medium text-foreground">alpackaai</strong> nos tomamos tu privacidad muy en serio. Este documento describe qué datos recopilamos, cómo los usamos y con quién los compartimos cuando utilizas nuestra Plataforma. Usamos <strong className="font-medium text-foreground">Google</strong> para la autenticación y <strong className="font-medium text-foreground">Paddle</strong> para la gestión de pagos.
        </div>

        <Section number="01" title="Datos que Recopilamos">
          <p>
            <strong className="font-medium text-foreground">a) Datos de autenticación (Google):</strong> Cuando inicias sesión con tu cuenta de Google, recibimos de Google tu dirección de correo electrónico, nombre completo y foto de perfil pública. No tenemos acceso a tu contraseña de Google ni a ningún otro dato privado de tu cuenta.
          </p>
          <p>
            <strong className="font-medium text-foreground">b) Datos de suscripción (Paddle):</strong> Cuando te suscribes, Paddle nos transmite un identificador de cliente (<em>customer_id</em>) y el estado de tu suscripción (activa, cancelada, etc.). No almacenamos en nuestros servidores ningún dato de tarjeta de crédito ni información bancaria.
          </p>
          <p>
            <strong className="font-medium text-foreground">c) Datos de uso:</strong> Registramos qué prompts visitas o guardas para personalizar tu experiencia y mejorar la calidad de nuestra biblioteca. Estos datos son anónimos a nivel de análisis agregado.
          </p>
          <p>
            <strong className="font-medium text-foreground">d) Datos técnicos:</strong> IP de acceso, tipo de navegador y dispositivo, recogidos automáticamente para garantizar la seguridad y el correcto funcionamiento de la Plataforma.
          </p>
        </Section>

        <Section number="02" title="Información de Pago — Paddle">
          <p>
            Todos los cobros son procesados por{' '}
            <a href="https://www.paddle.com" target="_blank" rel="noreferrer" className="font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary">
              Paddle.com
            </a>
            , nuestro Vendedor Autorizado (Merchant of Record). Paddle recopila y almacena de forma segura los datos de pago (número de tarjeta, dirección de facturación, información fiscal) según sus propias políticas, que puedes consultar en su{' '}
            <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer" className="font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary">
              Política de Privacidad
            </a>
            .
          </p>
          <p>
            <strong className="font-medium text-foreground">Únicamente almacenamos</strong> el estado de tu suscripción (activa / cancelada) y tu identificador de cliente de Paddle para poder ofrecerte acceso al contenido premium.
          </p>
        </Section>

        <Section number="03" title="Cómo Usamos tu Información">
          <ul className="list-none space-y-2">
            {[
              'Autenticarte y gestionar tu sesión de forma segura.',
              'Verificar el estado de tu suscripción y habilitarte el acceso al contenido premium.',
              'Enviarte correos transaccionales relevantes (confirmaciones, cambios en políticas).',
              'Mejorar la calidad y relevancia de los prompts disponibles en la biblioteca.',
              'Detectar y prevenir usos fraudulentos o abusivos de la Plataforma.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 text-accent">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>No utilizamos tus datos para publicidad dirigida ni los vendemos a terceros bajo ninguna circunstancia.</p>
        </Section>

        <Section number="04" title="Compartición con Terceros">
          <p>Compartimos datos únicamente con los siguientes proveedores de confianza, estrictamente necesarios para operar el Servicio:</p>
          <div className="space-y-3 mt-2">
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4">
              <span className="text-lg">🔐</span>
              <div>
                <p className="mb-0.5 text-xs font-medium text-foreground">Google (OAuth / Autenticación)</p>
                <p className="text-xs text-muted-foreground">Gestionamos el inicio de sesión mediante Google Identity Services a través de Supabase Auth. Google puede registrar eventos de autenticación según sus propias políticas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4">
              <span className="text-lg">💳</span>
              <div>
                <p className="mb-0.5 text-xs font-medium text-foreground">Paddle (Procesamiento de Pagos)</p>
                <p className="text-xs text-muted-foreground">Compartimos tu correo electrónico con Paddle para asociar tu pago con tu cuenta. Paddle gestiona toda la información financiera bajo sus propios estándares de seguridad (PCI-DSS).</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4">
              <span className="text-lg">🗄️</span>
              <div>
                <p className="mb-0.5 text-xs font-medium text-foreground">Supabase (Base de Datos e Infraestructura)</p>
                <p className="text-xs text-muted-foreground">Almacenamos tu perfil, prompts guardados y estado de suscripción en Supabase, desplegado en servidores con cifrado en reposo y en tránsito.</p>
              </div>
            </div>
          </div>
        </Section>

        <Section number="05" title="Cookies y Almacenamiento Local">
          <p>
            Utilizamos cookies de sesión y almacenamiento local (<em>localStorage</em>) únicamente para mantener tu sesión autenticada entre visitas. No empleamos cookies de rastreo, píxeles publicitarios ni herramientas de analytics de terceros.
          </p>
        </Section>

        <Section number="06" title="Seguridad de los Datos">
          <p>
            Implementamos medidas técnicas estándar de la industria: cifrado HTTPS en todas las comunicaciones, políticas de seguridad a nivel de fila (Row Level Security) en nuestra base de datos, y tokens de sesión de corta duración. Sin embargo, ningún sistema es 100% infalible y no podemos garantizar seguridad absoluta.
          </p>
        </Section>

        <Section number="07" title="Retención y Eliminación de Datos">
          <p>
            Conservamos tus datos durante el tiempo que tu cuenta esté activa. Si deseas eliminar tu cuenta y todos los datos asociados, envíanos un correo a{' '}
            <a href="mailto:eban112001@gmail.com" className="font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary">
              eban112001@gmail.com
            </a>{' '}
            y procederemos en un plazo máximo de 30 días.
          </p>
          <p>
            Ten en cuenta que Paddle puede conservar registros de transacciones por obligaciones fiscales y legales independientemente de nuestra gestión.
          </p>
        </Section>

        <Section number="08" title="Tus Derechos">
          <p>De acuerdo con la normativa de protección de datos aplicable, tienes derecho a:</p>
          <ul className="list-none space-y-1.5 mt-2">
            {[
              'Acceder a los datos personales que tenemos sobre ti.',
              'Rectificar datos inexactos o incompletos.',
              'Solicitar la eliminación de tus datos ("derecho al olvido").',
              'Oponerte al tratamiento de tus datos en determinadas circunstancias.',
              'Solicitar la portabilidad de tus datos en un formato estructurado.',
            ].map((right, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 text-accent">→</span>
                <span>{right}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Para ejercer cualquiera de estos derechos, contáctanos en{' '}
            <a href="mailto:eban112001@gmail.com" className="font-medium text-foreground underline decoration-border underline-offset-2 transition-colors hover:text-primary">
              eban112001@gmail.com
            </a>.
          </p>
        </Section>

        <Section number="09" title="Contacto">
          <p>Para cualquier pregunta sobre esta Política de Privacidad o el tratamiento de tus datos, puedes contactarnos en:</p>
          <p>
            <a
              href="mailto:eban112001@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-medium text-foreground transition hover:border-primary/40"
            >
              ✉ eban112001@gmail.com
            </a>
          </p>
          <p>Nos comprometemos a responder en un plazo máximo de 72 horas hábiles.</p>
        </Section>

        {/* Footer nav */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 alpackaai. Todos los derechos reservados.</span>
          <Link to="/terms" className="underline underline-offset-2 transition-colors hover:text-foreground">
            Términos de Servicio
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Privacy;