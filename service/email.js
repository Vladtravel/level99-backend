const sendgrid = require("@sendgrid/mail");
const Mailgen = require("mailgen");
require("dotenv").config();

class EmailService {
  #sender = sendgrid;
  #GenerateTemplate = Mailgen;
  constructor(env) {
    switch (env) {
      case "development":
        this.link = "http://localhost:3000";
        break;
      case "production":
        this.link = "https://level99-backend.herokuapp.com";
        break;
      default:
        this.link = "http://localhost:3000";
        break;
    }
  }

  #createTemplateVerifyEmail(verifyToken, name) {
    const mailGenerator = new this.#GenerateTemplate({
      theme: "neopolitan",
      product: {
        name: "Analytics book",
        link: "https://level-99-app.netlify.app/login",
      },
    });
    const email = {
      body: {
        name,
        intro: "Welcome to Analytics book! We're very excited to have you on board.",
        action: {
          instructions: "To get started with Analytics book, please click here:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Confirm your account",
            link: `${this.link}/users/verify/${verifyToken}`,
          },
        },
      },
    };

    const emailBody = mailGenerator.generate(email);
    return emailBody;
  }
  async sendVerifyEmail(verifyToken, email, name) {
    this.#sender.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: `${email}`, // Change to your recipient
      from: "vladtravel2015@gmail.com", // Change to your verified sender
      subject: "Verify email",
      html: this.#createTemplateVerifyEmail(verifyToken, name),
    };

    this.#sender
      .send(msg)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

module.exports = EmailService;
