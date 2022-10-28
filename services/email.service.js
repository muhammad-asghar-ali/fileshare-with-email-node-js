import nodeMailer from "nodemailer"

export const sendMail = async ({from, to, subject, text, html}) => {
    let transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    })

    let info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
    })
}