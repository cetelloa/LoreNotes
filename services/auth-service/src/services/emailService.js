const nodemailer = require('nodemailer');

// Create transporter based on email service
const createTransporter = () => {
    const service = process.env.EMAIL_SERVICE || 'gmail';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // For university emails (Office 365)
    if (service === 'hotmail' || service === 'outlook' || user?.includes('.edu')) {
        return nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: user,
                pass: pass
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false
            }
        });
    }

    // For Gmail
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });
};

const sendVerificationEmail = async (email, code, username) => {
    // If no email credentials configured, just log the code
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('========================================');
        console.log(`📧 VERIFICATION CODE for ${email}`);
        console.log(`   Code: ${code}`);
        console.log('========================================');
        return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
        from: `"LoreNotes" <${process.env.EMAIL_USER}>`,
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
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        // Fallback: log the code if email fails
        console.log('========================================');
        console.log(`📧 VERIFICATION CODE for ${email}`);
        console.log(`   Code: ${code}`);
        console.log('========================================');
        return true; // Still return true so registration continues
    }
};

module.exports = { sendVerificationEmail };
