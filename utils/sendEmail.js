import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Para simplificar la prueba sin configurar un SMTP real todavía, 
    // puedes usar etheral.email o tu cuenta de gmail. Por defecto usaremos una 
    // configuración simple o simplemente loggearemos la simulación si no hay variables.

    // Si tienes SendGrid o Gmail, configúralo en tu .env:
    // SMTP_HOST=smtp.gmail.com
    // SMTP_PORT=587
    // SMTP_EMAIL=tu_correo@gmail.com
    // SMTP_PASSWORD=tu_contraseña_de_aplicacion
    // FROM_EMAIL=tu_correo@gmail.com
    // FROM_NAME=Vectore Agency

    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // En el caso de usar gmail (como ya está en el .env)
        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Fallback robusto para Desarrollo sin SMTP configurado
        console.warn("⚠️ SMTP_HOST no está configurado. Generando cuenta de prueba Ethereal para enviar correo...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Vectore'} <${process.env.FROM_EMAIL || 'noreply@vectore.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    const info = await transporter.sendMail(message);

    if (!process.env.SMTP_HOST) {
        console.log("Correo de prueba enviado. URL para verlo: %s", nodemailer.getTestMessageUrl(info));
        options.testUrl = nodemailer.getTestMessageUrl(info);
    }

    return info;
};

export default sendEmail;
