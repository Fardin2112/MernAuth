import nodemailer from 'nodemailer';

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP_USER or SMTP_PASS is not defined in environment variables');
}

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: true, // Ensure secure connection
    },
    pool: true, // Optional: Use pooled connections
    rateLimit: 5, // Optional: Limit to 5 emails per second
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Transporter Error:', error);
    } else {
        console.log('SMTP Transporter is ready to send emails');
    }
});

export default transporter;
