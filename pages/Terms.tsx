import React from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-12 border-l-2 border-brand-surface pl-6">
    <h2 className="text-xl font-bold mb-4 uppercase tracking-wider">{title}</h2>
    <div className="text-sm md:text-base text-gray-600 font-sans leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

const Terms: React.FC = () => {
  return (
    <div className="bg-brand-bg min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase">
            términos de servicio
          </h1>
          <p className="font-mono text-gray-500 text-xs uppercase tracking-widest">
            Última actualización: 26 de Octubre, 2023
          </p>
        </div>

        <Section title="1. Aceptación de los Términos">
          <p>
            Al acceder y utilizar PromptBank ("el Servicio"), aceptas y te comprometes a cumplir los términos y disposiciones de este acuerdo. Si no estás de acuerdo con estos términos, por favor no utilices este Servicio.
          </p>
        </Section>

        <Section title="2. Descripción del Servicio">
          <p>
            PromptBank es una biblioteca de prompts de IA basada en suscripción. Proporcionamos acceso a una base de datos curada de prompts de texto para su uso con modelos de IA de terceros (por ejemplo, ChatGPT, Midjourney). No somos propietarios ni operamos los modelos de IA en sí mismos.
          </p>
        </Section>

        <Section title="3. Cuentas y Autenticación">
          <p>
            El acceso al Servicio requiere una cuenta de Google ("Sign in with Google"). Eres responsable de mantener la confidencialidad de tus credenciales de inicio de sesión. No nos hacemos responsables de ninguna pérdida o daño derivado de tu falta de protección de tu cuenta de Google.
          </p>
        </Section>

        <Section title="4. Suscripciones y Pagos (Paddle)">
          <p>
            Nuestro proceso de pedido es realizado por nuestro revendedor en línea Paddle.com. Paddle.com es el Vendedor Autorizado (Merchant of Record) para todos nuestros pedidos. Paddle proporciona todas las consultas de servicio al cliente y maneja las devoluciones.
          </p>
          <p>
            <strong>Facturación:</strong> Se te cobrará una tarifa plana de $3.90 USD por mes. La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período de facturación actual.
          </p>
          <p>
            <strong>Cancelaciones:</strong> Puedes cancelar tu suscripción en cualquier momento a través del panel de control de tu cuenta o contactando al soporte de Paddle. El acceso al Servicio continuará hasta el final de tu ciclo de facturación actual.
          </p>
          <p>
            <strong>Reembolsos:</strong> Debido a la naturaleza digital del contenido (acceso inmediato a la biblioteca completa), generalmente no ofrecemos reembolsos una vez que el mes ha comenzado, excepto cuando lo exija la ley local.
          </p>
        </Section>

        <Section title="5. Propiedad Intelectual y Uso">
          <p>
            <strong>Los Prompts:</strong> PromptBank te otorga una licencia no exclusiva, mundial y perpetua para utilizar los prompts encontrados en nuestra biblioteca para la generación personal o comercial de contenido.
          </p>
          <p>
            <strong>La Plataforma:</strong> No puedes realizar scraping, copiar, reproducir o revender el acceso a la plataforma PromptBank en sí misma. La venta de nuestros prompts como un conjunto de datos en bruto (dataset) está estrictamente prohibida.
          </p>
        </Section>

        <Section title="6. Renuncia de Garantías">
          <p>
            El Servicio se proporciona "tal cual" y "según disponibilidad". No ofrecemos garantías con respecto a los resultados generados por modelos de IA de terceros utilizando nuestros prompts, ya que estos modelos no son deterministas y están sujetos a cambios por parte de sus respectivos proveedores.
          </p>
        </Section>

        <Section title="7. Contacto">
          <p>
            Para consultas de facturación, por favor contacta a Paddle. Para soporte técnico sobre la plataforma, contacta a support@promptbank.ai.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default Terms;