const SibApiV3Sdk = require('@getbrevo/brevo');

// Email HTML template
const getEmailHtml = (code, username) => `
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
`;

// Send email using Brevo (HTTP API - not blocked by Render)
const sendWithBrevo = async (email, code, username) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER || 'noreply@lorenotes.com';

    if (!apiKey) return null;

    console.log(`📧 Sending via Brevo to: ${email}`);

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    const sendSmtpEmail = {
        sender: { name: 'LoreNotes', email: senderEmail },
        to: [{ email: email }],
        subject: '🎨 LoreNotes - Verifica tu cuenta',
        htmlContent: getEmailHtml(code, username)
    };

    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Email sent via Brevo! MessageId: ${result.body?.messageId || 'sent'}`);
        return true;
    } catch (error) {
        console.error(`❌ Brevo error: ${error.message}`);
        if (error.body) {
            console.error(`   Details: ${JSON.stringify(error.body)}`);
        }
        return null;
    }
};

// Main function
const sendVerificationEmail = async (email, code, username) => {
    console.log(`\n📤 Sending verification email to: ${email}`);

    // Try Brevo (HTTP API - works on Render!)
    const sent = await sendWithBrevo(email, code, username);
    if (sent) return true;

    // Brevo failed - log the code for manual verification
    console.log('⚠️ Email sending failed. Logging code for manual use:');
    console.log('========================================');
    console.log(`📧 VERIFICATION CODE for ${email}`);
    console.log(`   Code: ${code}`);
    console.log('========================================');

    return true; // Return true so registration continues
};

module.exports = { sendVerificationEmail };
