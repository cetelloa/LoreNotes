const nodemailer = require('nodemailer');

// Create Gmail transporter with explicit configuration
const createTransporter = () => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log('📧 Email config:', {
        user: user ? `${user.substring(0, 5)}...` : 'NOT SET',
        pass: pass ? 'SET (hidden)' : 'NOT SET'
    });

    // Gmail configuration with explicit settings
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
            user: user,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

const sendVerificationEmail = async (email, code, username) => {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // If no email credentials configured, just log the code
    if (!user || !pass) {
        console.log('⚠️ Email credentials not configured');
        console.log('========================================');
        console.log(`📧 VERIFICATION CODE for ${email}`);
        console.log(`   Code: ${code}`);
        console.log('========================================');
        return true;
    }

    console.log(`📤 Attempting to send email to: ${email}`);
    console.log(`   From: ${user}`);

    const transporter = createTransporter();

    const mailOptions = {
        from: `"LoreNotes" <${user}>`,
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
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully!`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        console.error('   Full error:', error);
        // Fallback: log the code if email fails
        console.log('========================================');
        console.log(`📧 VERIFICATION CODE for ${email}`);
        console.log(`   Code: ${code}`);
        console.log('========================================');
        return true; // Still return true so registration continues
    }
};

module.exports = { sendVerificationEmail };
