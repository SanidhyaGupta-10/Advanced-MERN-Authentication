import { mailtrapClient, sender } from "../mailtrap/mailtrap.congif.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";


export const senderVerificationEmail = async (email, verificationToken) => {

    const recipient = { email: email }

    try {
        const res = await mailtrapClient.send({
            from: sender,
            to: [recipient],
            subject: "Please verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        })

        console.log("Verification email sent:", res);
    } catch (error) {
        console.error("Error sending verification email:", error);

        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const recipient = { email: email };

    try {
        await mailtrapClient.send({
            from: sender,
            to: [recipient],
            template_uuid: "c05bdd2b-59bb-4454-a825-2fbccef290f4",
            template_variables: {
                "company_info_name": "Void",
                name: name,
            },
        });

        console.log("Welcome email sent successfully")

    } catch (error) {
        console.error("Error sending welcome email:", error);

        throw new Error(`Failed to send welcome email: ${error.message}`);
    }
}