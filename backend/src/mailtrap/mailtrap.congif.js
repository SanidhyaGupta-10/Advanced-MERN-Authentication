import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_API_TOKEN, // Production token
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Demo Authentication Service",
}