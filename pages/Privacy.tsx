import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-12 border-l-2 border-brand-surface pl-6">
    <h2 className="text-xl font-bold mb-4 uppercase tracking-wider">{title}</h2>
    <div className="text-sm md:text-base text-gray-600 font-sans leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

const Privacy: React.FC = () => {
  return (
    <div className="bg-brand-bg min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase">
            política de privacidad
          </h1>
          <p className="font-mono text-gray-500 text-xs uppercase tracking-widest">
            Última actualización: 26 de Octubre, 2023
          </p>
        </div>

        <Section title="1. Información que Recopilamos">
          <p>
            <strong>Datos de Cuenta (Google):</strong> Cuando te registras usando Google, recopilamos tu dirección de correo electrónico, nombre y URL de foto de perfil. No tenemos acceso a tu contraseña de Google ni a otros datos privados de Google.
          </p>
          <p>
            <strong>Datos de Uso:</strong> Recopilamos datos anónimos sobre qué prompts se ven o copian para ayudarnos a mejorar la relevancia de nuestra biblioteca.
          </p>
        </Section>

        <Section title="2. Información de Pago">
          <p>
            <strong>No almacenamos los datos de tu tarjeta de crédito.</strong> Todas las transacciones financieras son procesadas por **Paddle**, nuestro Vendedor Autorizado (Merchant of Record).
          </p>
          <p>
            Paddle recopila los datos personales necesarios para procesar el pago (como número de tarjeta de crédito, dirección de facturación e identificación fiscal cuando corresponda). El uso de tus datos por parte de Paddle se rige por su <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer" className="underline decoration-2 hover:text-black">Política de Privacidad</a>.
          </p>
        </Section>

        <Section title="3. Cómo Usamos tu Información">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Para proporcionar acceso a la biblioteca de PromptBank.</li>
            <li>Para gestionar el estado de tu suscripción a través de Paddle.</li>
            <li>Para enviar correos electrónicos transaccionales importantes (facturas, restablecimiento de contraseñas, actualizaciones de políticas).</li>
          </ul>
        </Section>

        <Section title="4. Cookies y Almacenamiento Local">
          <p>
            Utilizamos cookies y almacenamiento local únicamente con el propósito de mantener tu sesión autenticada. No utilizamos cookies de rastreo de terceros para fines publicitarios.
          </p>
        </Section>

        <Section title="5. Retención y Eliminación de Datos">
          <p>
            Conservamos la información de tu cuenta mientras tu suscripción esté activa. Si cancelas tu cuenta, podemos conservar un historial básico de transacciones para fines fiscales y de cumplimiento legal.
          </p>
          <p>
            Puedes solicitar la eliminación completa de los datos de tu cuenta contactando a privacy@promptbank.ai. Ten en cuenta que no podemos eliminar los registros de pago mantenidos por Paddle por razones fiscales legales.
          </p>
        </Section>

        <Section title="6. Intercambio con Terceros">
          <p>
            No vendemos, intercambiamos ni alquilamos tu información de identificación personal a otros. Compartimos datos solo con:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Paddle:</strong> Para procesamiento de pagos y cumplimiento fiscal.</li>
            <li><strong>Google Firebase/Auth:</strong> Para servicios de verificación de identidad.</li>
          </ul>
        </Section>
      </div>
    </div>
  );
};

export default Privacy;