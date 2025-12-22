const { Resend } = require('resend');

// Initialize Resend with API key
const getResend = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;
    return new Resend(apiKey);
};

const sendVerificationEmail = async (email, code, username) => {
    const resend = getResend();

    // If no Resend API key, just log the code
    if (!resend) {
        console.log('⚠️ RESEND_API_KEY not configured');
        console.log('========================================');
        console.log(`📧 VERIFICATION CODE for ${email}`);
        console.log(`   Code: ${code}`);
        console.log('========================================');
        return true;
    }

    console.log(`📤 Sending email via Resend to: ${email}`);

    try {
        const { data, error } = await resend.emails.send({
            from: 'LoreNotes <onboarding@resend.dev>',
            to: email,
            subject: '🎨 LoreNotes - Verifica tu cuenta',
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #FFFEF7; border: 3px dashed #2D3142; border-radius: 20px;">
                    <h1 style="color: #FF6B9D; text-align: center; font-size: 28px;">¡Bienvenido a LoreNotes! 🎨</h1>
                    <p style="color: #2D3142; font-size: 16px;">Hola <strong>${username}</strong>,</p>
                    <p style="color: #2D3142; font-size: 16px;">Tu código de verificación es:</p>
                    <div style="background: linear-gradient(135deg, #FF6B9D, #FEC180); padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2D3142;">${code}</span>
                    </div>
                    <p style="color: #888; font-size: 14px; text-align: center;">Este código expira en 15 minutos.</p>
                    <p style="color: #2D3142; font-size: 14px; text-align: center; margin-top: 30px;">¡Prepárate para crear cosas increíbles! ✨</p>
                </div>
            `
        });

        if (error) {
            console.error('❌ Resend error:', error);
            console.log('========================================');
            console.log(`📧 VERIFICATION CODE for ${email}`);
            console.log(`   Code: ${code}`);
            console.log('========================================');
            return true;
        }

        console.log(`✅ Email sent successfully! ID: ${data.id}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        console.log('========================================');
        console.log(`📧 VERIFICATION CODE for ${email}`);
        console.log(`   Code: ${code}`);
        console.log('========================================');
        return true;
    }
};

module.exports = { sendVerificationEmail };
