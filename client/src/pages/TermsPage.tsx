import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export const TermsPage = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/95 backdrop-blur-sm border-4 border-ink-black rounded-2xl p-6 md:p-10 shadow-[8px_8px_0px_rgba(45,49,66,0.3)]"
            >
                <div className="flex items-center gap-3 mb-8">
                    <FileText size={32} className="text-primary-craft" />
                    <h1 className="text-3xl md:text-4xl font-heading text-ink-black">
                        Términos y Condiciones
                    </h1>
                </div>

                <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
                    <p className="text-sm text-gray-500">Última actualización: Diciembre 2024</p>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">1. Aceptación de Términos</h2>
                        <p>
                            Al acceder y utilizar LoreNotes, aceptas estar sujeto a estos términos y condiciones.
                            Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestro servicio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">2. Descripción del Servicio</h2>
                        <p>
                            LoreNotes es una plataforma de venta de plantillas digitales creativas para diversos propósitos
                            como bodas, cumpleaños, negocios y educación. Los usuarios pueden comprar, descargar y usar
                            las plantillas según los términos de licencia aplicables.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">3. Cuentas de Usuario</h2>
                        <p>
                            Para realizar compras, debes crear una cuenta proporcionando información precisa y completa.
                            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">4. Compras y Pagos</h2>
                        <p>
                            Todos los precios están indicados en dólares estadounidenses (USD).
                            Al completar una compra, recibirás acceso inmediato a las plantillas adquiridas
                            en la sección "Mi Cuenta".
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">5. Licencia de Uso</h2>
                        <p>
                            Las plantillas adquiridas son para uso personal o comercial limitado.
                            No está permitida la reventa, redistribución o sublicenciamiento de las plantillas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">6. Política de Reembolso</h2>
                        <p>
                            Debido a la naturaleza digital de los productos, no ofrecemos reembolsos una vez
                            que la plantilla ha sido descargada. Si tienes problemas técnicos, contáctanos
                            a lorenotes2@gmail.com.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">7. Propiedad Intelectual</h2>
                        <p>
                            Todos los diseños, gráficos y contenido de LoreNotes están protegidos por derechos de autor.
                            La compra de una plantilla no transfiere derechos de propiedad intelectual.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-heading text-ink-black">8. Contacto</h2>
                        <p>
                            Para cualquier pregunta sobre estos términos, contáctanos en:
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
