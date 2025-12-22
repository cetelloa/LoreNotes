const nodemailer = require('nodemailer');
const { Resend } = require('resend');

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

// Try Outlook/Hotmail SMTP
const sendWithOutlook = async (email, code, username) => {
    const user = process.env.OUTLOOK_USER;
    const pass = process.env.OUTLOOK_PASS;

    if (!user || !pass) return null;

    console.log(`📧 Trying Outlook SMTP for: ${email}`);

    const transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });

    try {
        const info = await transporter.sendMail({
            from: `"LoreNotes" <${user}>`,
            to: email,
            subject: '🎨 LoreNotes - Verifica tu cuenta',
            html: getEmailHtml(code, username)
        });
        console.log(`✅ Email sent via Outlook! ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`❌ Outlook error: ${error.message}`);
        return null;
    }
};

// Try Resend API (HTTP-based, bypasses SMTP blocks)
const sendWithResend = async (email, code, username) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return null;

    console.log(`📧 Trying Resend API for: ${email}`);

    const resend = new Resend(apiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: 'LoreNotes <onboarding@resend.dev>',
            to: email,
            subject: '🎨 LoreNotes - Verifica tu cuenta',
            html: getEmailHtml(code, username)
        });

        if (error) {
            console.error(`❌ Resend error: ${error.message}`);
            return null;
        }

        console.log(`✅ Email sent via Resend! ID: ${data.id}`);
        return true;
    } catch (error) {
        console.error(`❌ Resend error: ${error.message}`);
        return null;
    }
};

// Main function - tries multiple methods
const sendVerificationEmail = async (email, code, username) => {
    console.log(`\n📤 Sending verification email to: ${email}`);

    // Try Outlook first
    let sent = await sendWithOutlook(email, code, username);
    if (sent) return true;

    // Try Resend as fallback
    sent = await sendWithResend(email, code, username);
    if (sent) return true;

    // All methods failed - log the code for manual verification
    console.log('⚠️ All email methods failed. Logging code for manual use:');
    console.log('========================================');
    console.log(`📧 VERIFICATION CODE for ${email}`);
    console.log(`   Code: ${code}`);
    console.log('========================================');

    return true; // Return true so registration continues
};

module.exports = { sendVerificationEmail };
