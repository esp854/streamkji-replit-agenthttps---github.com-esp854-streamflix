declare module "./mailer" {
  export function sendEmail(to: string, subject: string, html: string): Promise<any>;
  export default sendEmail;
}