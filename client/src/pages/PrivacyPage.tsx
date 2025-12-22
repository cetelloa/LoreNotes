import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export const PrivacyPage = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-6 md:p-10 shadow-[8px_8px_0px_rgba(45,49,66,0.3)]"
            >
                <div className="flex items-center gap-3 mb-8">
                    <Shield size={32} className="text-primary-craft" />
                    <h1 className="text-3xl md:text-4xl font-heading text-ink-black">
                        Política de Privacidad
                    </h1>
                </div>

                <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                    <p className="text-sm text-gray-500">Última actualización: Diciembre 2024</p>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">1. Información que Recopilamos</h2>
                        <p>Recopilamos la siguiente información cuando usas LoreNotes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Nombre de usuario y dirección de correo electrónico</li>
                            <li>Información de compras y transacciones</li>
                            <li>Datos de uso del sitio web</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">2. Uso de la Información</h2>
                        <p>Utilizamos tu información para:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Procesar tus compras y proporcionarte acceso a las plantillas</li>
                            <li>Enviar correos de verificación y notificaciones importantes</li>
                            <li>Mejorar nuestro servicio y experiencia de usuario</li>
                            <li>Responder a tus consultas de soporte</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">3. Protección de Datos</h2>
                        <p>
                            Implementamos medidas de seguridad para proteger tu información personal.
                            Tus contraseñas se almacenan de forma encriptada y nunca compartimos
                            tus datos con terceros sin tu consentimiento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">4. Cookies</h2>
                        <p>
                            Utilizamos cookies para mantener tu sesión activa y mejorar tu experiencia.
                            Puedes configurar tu navegador para rechazar cookies, aunque esto puede
                            afectar algunas funcionalidades del sitio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">5. Tus Derechos</h2>
                        <p>Tienes derecho a:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Acceder a tus datos personales</li>
                            <li>Solicitar la corrección de datos incorrectos</li>
                            <li>Solicitar la eliminación de tu cuenta</li>
                            <li>Retirar tu consentimiento en cualquier momento</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">6. Cambios en la Política</h2>
                        <p>
                            Nos reservamos el derecho de actualizar esta política de privacidad.
                            Te notificaremos sobre cambios significativos a través de tu correo electrónico.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">7. Contacto</h2>
                        <p>
                            Para ejercer tus derechos o hacer preguntas sobre privacidad, contáctanos en:
                            <a href="mailto:lorenotes2@gmail.com" className="text-primary-craft hover:underline ml-1">
                                lorenotes2@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </motion.div>
        </div>
    );
};
