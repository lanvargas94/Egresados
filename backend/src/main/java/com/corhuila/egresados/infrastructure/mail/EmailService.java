package com.corhuila.egresados.infrastructure.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final String from;
    private final String confirmUrlBase;

    public EmailService(JavaMailSender mailSender,
                        @Value("${app.mailFrom}") String from,
                        @Value("${app.confirmUrl}") String confirmUrlBase) {
        this.mailSender = mailSender;
        this.from = from;
        this.confirmUrlBase = confirmUrlBase;
    }

    public void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
        } catch (MessagingException e) {
            throw new RuntimeException("Error enviando correo: " + e.getMessage(), e);
        }
    }

    public void sendEmailConfirmation(String to, String token, String nombre) {
        String link = confirmUrlBase + token;
        String body = "<p>Hola " + (nombre == null ? "" : nombre) + ",</p>" +
                "<p>Confirma tu correo personal para la Plataforma de Egresados CORHUILA.</p>" +
                "<p><a href='" + link + "' style='background:#005bbb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;'>Confirmar correo</a></p>" +
                "<p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>" +
                "<p>" + link + "</p>" +
                "<p>Gracias.</p>";
        sendHtml(to, "Confirma tu correo – Egresados CORHUILA", body);
    }
}

