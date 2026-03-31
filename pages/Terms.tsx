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

const Terms: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pb-24 font-sans">
      {/* Header */}
      <div className="border-b border-zinc-100 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase mb-4">documento legal</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 mb-3">
            términos de servicio
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Última actualización: 2 de marzo de 2026 · Versión 1.0
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Intro */}
        <div className="mb-12 p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm text-zinc-600 leading-relaxed">
          Al acceder y utilizar <strong className="text-zinc-900">alpackaai</strong>{' '}
          (en adelante, "el Servicio" o "la Plataforma"), aceptas íntegramente los presentes Términos de Servicio. Si no estás de acuerdo con alguna de sus disposiciones, te pedimos que no utilices la Plataforma.
        </div>

        <Section number="01" title="Descripción del Servicio">
          <p>
            alpackaai es una biblioteca de prompts de inteligencia artificial basada en suscripción mensual. Proporcionamos acceso a una colección curada de prompts estructurados para uso con modelos de lenguaje de terceros (como ChatGPT, Claude, Gemini u otros). No somos propietarios ni operamos los modelos de IA en sí mismos, y los resultados generados dependen exclusivamente de dichos modelos.
          </p>
        </Section>

        <Section number="02" title="Cuentas y Autenticación (Google)">
          <p>
            El acceso al Servicio se realiza mediante <strong className="text-zinc-700">inicio de sesión con Google</strong> (<em>Sign in with Google</em>), gestionado a través de Supabase Auth. Al autenticarte, aceptas también las{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 transition-colors">
              Condiciones del Servicio de Google
            </a>
            .
          </p>
          <p>
            Eres el único responsable de mantener la seguridad de tu cuenta de Google. No nos hacemos responsables de accesos no autorizados derivados de la falta de protección de tus credenciales.
          </p>
        </Section>

        <Section number="03" title="Suscripciones y Pagos (Paddle)">
          <p>
            El proceso de pago es gestionado íntegramente por{' '}
            <a href="https://www.paddle.com" target="_blank" rel="noreferrer" className="font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 transition-colors">
              Paddle.com
            </a>
            , nuestro <strong className="text-zinc-700">Vendedor Autorizado (Merchant of Record)</strong>. Paddle es responsable de la facturación, el cobro de impuestos aplicables, y la gestión de disputas y reembolsos.
          </p>
          <p>
            <strong className="text-zinc-700">Precio:</strong> La suscripción tiene un coste de <strong className="text-zinc-700">$4 USD / mes</strong>, con renovación automática al inicio de cada período. Los precios no incluyen impuestos locales que Paddle pueda aplicar según tu ubicación.
          </p>
          <p>
            <strong className="text-zinc-700">Cancelación:</strong> Puedes cancelar en cualquier momento desde el panel de tu cuenta o a través del soporte de Paddle. El acceso al contenido premium se mantiene hasta el final del período de facturación en curso, sin cargos adicionales.
          </p>
          <p>
            <strong className="text-zinc-700">Reembolsos:</strong> Dado que el acceso al contenido es inmediato al activarse la suscripción, no ofrecemos reembolsos por períodos ya iniciados, salvo que la legislación local vigente lo exija. Para solicitar un reembolso, contacta directamente al soporte de Paddle.
          </p>
        </Section>

        <Section number="04" title="Propiedad Intelectual y Licencia de Uso">
          <p>
            <strong className="text-zinc-700">Licencia sobre los Prompts:</strong> Al suscribirte, obtienes una licencia personal, no exclusiva e intransferible para utilizar los prompts de la biblioteca con fines personales o comerciales propios.
          </p>
          <p>
            <strong className="text-zinc-700">Restricciones:</strong> Queda estrictamente prohibido copiar, redistribuir, revender o publicar los prompts como producto propio, hacer scraping de la plataforma, o comercializar el acceso a la misma bajo cualquier formato.
          </p>
        </Section>

        <Section number="05" title="Conducta del Usuario">
          <p>
            Te comprometes a no utilizar el Servicio para generar contenido ilegal, difamatorio, engañoso o que infrinja derechos de terceros. alpackaai se reserva el derecho de suspender cuentas que violen estas condiciones sin previo aviso.
          </p>
        </Section>

        <Section number="06" title="Limitación de Responsabilidad">
          <p>
            El Servicio se proporciona "tal cual" y "según disponibilidad". No garantizamos resultados específicos derivados del uso de nuestros prompts, ya que estos dependen de modelos de IA de terceros que están sujetos a cambios. En ningún caso alpackaai será responsable de daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma.
          </p>
        </Section>

        <Section number="07" title="Modificaciones de los Términos">
          <p>
            Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios significativos serán notificados con al menos 7 días de anticipación mediante un aviso visible en la Plataforma o por correo electrónico. El uso continuado del Servicio tras la entrada en vigor de los cambios constituye tu aceptación de los mismos.
          </p>
        </Section>

        <Section number="08" title="Legislación Aplicable">
          <p>
            Estos Términos se rigen por las leyes aplicables en la jurisdicción del operador. Para cualquier controversia, las partes acuerdan someterse a la jurisdicción de los tribunales competentes.
          </p>
        </Section>

        <Section number="09" title="Contacto">
          <p>
            Para cualquier consulta sobre estos Términos, soporte técnico o cualquier otro asunto relacionado con la Plataforma, puedes contactarnos en:
          </p>
          <p>
            <a
              href="mailto:eban112001@gmail.com"
              className="inline-flex items-center gap-2 font-mono font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-100 transition-all text-xs"
            >
              ✉ eban112001@gmail.com
            </a>
          </p>
          <p>
            Para consultas específicas de facturación o disputas de pago, por favor contacta directamente al soporte de{' '}
            <a href="https://www.paddle.com/help" target="_blank" rel="noreferrer" className="font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 transition-colors">
              Paddle
            </a>.
          </p>
        </Section>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <span>© 2026 alpackaai. Todos los derechos reservados.</span>
          <Link to="/privacy" className="hover:text-zinc-700 transition-colors underline underline-offset-2">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;