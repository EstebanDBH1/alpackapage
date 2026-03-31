import React from 'react';
import { Link } from 'react-router-dom';

const Section: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="mb-12">
    <div className="flex items-baseline gap-3 mb-4">
      <span className="text-[10px] font-mono text-zinc-300 tracking-widest">{number}</span>
      <h2 className="text-base font-black tracking-tight text-zinc-900">{title}</h2>
    </div>
    <div className="text-sm text-zinc-500 font-sans leading-relaxed space-y-3 pl-8 border-l border-zinc-100">
      {children}
    </div>
  </div>
);

const Privacy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pb-24 font-sans">
      {/* Header */}
      <div className="border-b border-zinc-100 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase mb-4">documento legal</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 mb-3">
            política de privacidad
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Última actualización: 2 de marzo de 2026 · Versión 1.0
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Intro */}
        <div className="mb-12 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm text-zinc-600 leading-relaxed">
          En <strong className="text-zinc-900">alpackaai</strong> nos tomamos tu privacidad muy en serio. Este documento describe qué datos recopilamos, cómo los usamos y con quién los compartimos cuando utilizas nuestra Plataforma. Usamos <strong className="text-zinc-900">Google</strong> para la autenticación y <strong className="text-zinc-900">Paddle</strong> para la gestión de pagos.
        </div>

        <Section number="01" title="Datos que Recopilamos">
          <p>
            <strong className="text-zinc-700">a) Datos de autenticación (Google):</strong> Cuando inicias sesión con tu cuenta de Google, recibimos de Google tu dirección de correo electrónico, nombre completo y foto de perfil pública. No tenemos acceso a tu contraseña de Google ni a ningún otro dato privado de tu cuenta.
          </p>
          <p>
            <strong className="text-zinc-700">b) Datos de suscripción (Paddle):</strong> Cuando te suscribes, Paddle nos transmite un identificador de cliente (<em>customer_id</em>) y el estado de tu suscripción (activa, cancelada, etc.). No almacenamos en nuestros servidores ningún dato de tarjeta de crédito ni información bancaria.
          </p>
          <p>
            <strong className="text-zinc-700">c) Datos de uso:</strong> Registramos qué prompts visitas o guardas para personalizar tu experiencia y mejorar la calidad de nuestra biblioteca. Estos datos son anónimos a nivel de análisis agregado.
          </p>
          <p>
            <strong className="text-zinc-700">d) Datos técnicos:</strong> IP de acceso, tipo de navegador y dispositivo, recogidos automáticamente para garantizar la seguridad y el correcto funcionamiento de la Plataforma.
          </p>
        </Section>

        <Section number="02" title="Información de Pago — Paddle">
          <p>
            Todos los cobros son procesados por{' '}
            <a href="https://www.paddle.com" target="_blank" rel="noreferrer" className="font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 transition-colors">
              Paddle.com
            </a>
            , nuestro Vendedor Autorizado (Merchant of Record). Paddle recopila y almacena de forma segura los datos de pago (número de tarjeta, dirección de facturación, información fiscal) según sus propias políticas, que puedes consultar en su{' '}
            <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer" className="font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 transition-colors">
              Política de Privacidad
            </a>
            .
          </p>
          <p>
            <strong className="text-zinc-700">Únicamente almacenamos</strong> el estado de tu suscripción (activa / cancelada) y tu identificador de cliente de Paddle para poder ofrecerte acceso al contenido premium.
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
                <span className="text-zinc-300 mt-0.5 flex-shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>No utilizamos tus datos para publicidad dirigida ni los vendemos a terceros bajo ninguna circunstancia.</p>
        </Section>

        <Section number="04" title="Compartición con Terceros">
          <p>Compartimos datos únicamente con los siguientes proveedores de confianza, estrictamente necesarios para operar el Servicio:</p>
          <div className="space-y-3 mt-2">
            <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-lg">🔐</span>
              <div>
                <p className="font-bold text-zinc-800 text-xs mb-0.5">Google (OAuth / Autenticación)</p>
                <p className="text-xs text-zinc-500">Gestionamos el inicio de sesión mediante Google Identity Services a través de Supabase Auth. Google puede registrar eventos de autenticación según sus propias políticas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-lg">💳</span>
              <div>
                <p className="font-bold text-zinc-800 text-xs mb-0.5">Paddle (Procesamiento de Pagos)</p>
                <p className="text-xs text-zinc-500">Compartimos tu correo electrónico con Paddle para asociar tu pago con tu cuenta. Paddle gestiona toda la información financiera bajo sus propios estándares de seguridad (PCI-DSS).</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-lg">🗄️</span>
              <div>
                <p className="font-bold text-zinc-800 text-xs mb-0.5">Supabase (Base de Datos e Infraestructura)</p>
                <p className="text-xs text-zinc-500">Almacenamos tu perfil, prompts guardados y estado de suscripción en Supabase, desplegado en servidores con cifrado en reposo y en tránsito.</p>
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
            <a href="mailto:eban112001@gmail.com" className="font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 transition-colors">
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
                <span className="text-zinc-300 mt-0.5 flex-shrink-0">→</span>
                <span>{right}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Para ejercer cualquiera de estos derechos, contáctanos en{' '}
            <a href="mailto:eban112001@gmail.com" className="font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 transition-colors">
              eban112001@gmail.com
            </a>.
          </p>
        </Section>

        <Section number="09" title="Contacto">
          <p>Para cualquier pregunta sobre esta Política de Privacidad o el tratamiento de tus datos, puedes contactarnos en:</p>
          <p>
            <a
              href="mailto:eban112001@gmail.com"
              className="inline-flex items-center gap-2 font-mono font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-100 transition-all text-xs"
            >
              ✉ eban112001@gmail.com
            </a>
          </p>
          <p>Nos comprometemos a responder en un plazo máximo de 72 horas hábiles.</p>
        </Section>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <span>© 2026 alpackaai. Todos los derechos reservados.</span>
          <Link to="/terms" className="hover:text-zinc-700 transition-colors underline underline-offset-2">
            Términos de Servicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Privacy;