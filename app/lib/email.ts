import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APPPASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendUserRegister = async (
  email: string,
  name: string,
  username: string,
  rol: string,
  tempPassword: string
) => {
  const message = {
    from: `Directorio Contactos Municipalidad El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Cuenta Creada - Directorio Contactos Municipalidad El Quisco",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Tu Cuenta ha sido Creada</h2>
        <p>Hola ${name},</p>
        <p>Un administrador ha creado una cuenta de tipo <strong>${rol}</strong> para ti en la plataforma Directorio Contactos Municipalidad El Quisco.</p>
        
        <div style="background: #f1f1f1; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold;">Tus credenciales:</p>
          <p><strong>Usuario:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Contraseña temporal:</strong> ${tempPassword}</p>
        </div>

        <p><strong>Importante:</strong> Por motivos de seguridad, cambia tu contraseña en la ventana de inicio de sesión.</p>
        <p>Puedes acceder a la plataforma en: <a href="https://contactos.elquisco.cl">contactos.elquisco.cl</a></p>

        <p>Saludos,<br>Sistema Directorio Contactos Municipalidad El Quisco</p>
        <p style="font-size: 12px; color: #666;">Este es un correo automático, favor no responder.</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendPasswordResetCode = async (
  email: string,
  name: string,
  code: string
) => {
  const message = {
    from: `Directorio Contactos Municipalidad El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Código de Seguridad - Restablecimiento de Contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Código de Seguridad</h2>
        <p>Hola ${name},</p>
        <p>Has solicitado restablecer tu contraseña. Usa el siguiente código:</p>
        <div style="background: #f1f1f1; padding: 15px; font-size: 22px; font-weight: bold; text-align: center; letter-spacing: 3px; margin: 20px 0;">
          ${code}
        </div>
        <p>Este código expirará en 15 minutos.</p>
        <p>Si no hiciste esta solicitud, puedes ignorar este mensaje.</p>
        <p>Saludos,<br>Sistema Directorio Contactos Municipalidad El Quisco</p>
        <p style="font-size: 12px; color: #666;">Este es un correo automático, favor no responder.</p>
      </div>
    `,
  };
  return transporter.sendMail(message);
};

export const sendPasswordResetConfirmation = async (
  email: string,
  name: string
) => {
  const message = {
    from: `Directorio Contactos Municipalidad El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Contraseña Restablecida con Éxito",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Contraseña Restablecida</h2>
        <p>Hola ${name},</p>
        <p>Te confirmamos que tu contraseña ha sido restablecida correctamente.</p>
        <p>Ya puedes acceder con tu nueva contraseña.</p>
        <p>Si no realizaste este cambio, contacta al equipo de soporte inmediatamente.</p>
        <p>Saludos,<br>Sistema Directorio Contactos Municipalidad El Quisco</p>
        <p style="font-size: 12px; color: #666;">Este es un correo automático, favor no responder.</p>
      </div>
    `,
  };
  return transporter.sendMail(message);
};

export const sendAccountStatusChange = async (
  email: string,
  name: string,
  status: "Activa" | "Desactivada" | "Suspendida"
) => {
  let statusMessage = "";

  switch (status) {
    case "Activa":
      statusMessage =
        "Tu cuenta ha sido <strong>activada</strong> y ya puedes acceder a la plataforma.";
      break;
    case "Desactivada":
      statusMessage =
        "Tu cuenta ha sido <strong>desactivada</strong>. No podrás iniciar sesión hasta que sea reactivada.";
      break;
    case "Suspendida":
      statusMessage =
        "Tu cuenta ha sido <strong>suspendida temporalmente</strong>. Contacta al administrador para más detalles.";
      break;
    default:
      statusMessage = "Se ha producido un cambio en el estado de tu cuenta.";
  }

  const message = {
    from: `Directorio Contactos Municipalidad El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Cambio de Estado de Cuenta - Directorio Contactos`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Estado de Cuenta Actualizado</h2>
        <p>Hola ${name},</p>
        <p>${statusMessage}</p>
        <p>Si tienes dudas sobre este cambio, por favor contacta al equipo de soporte.</p>
        <p>Saludos,<br>Sistema Directorio Contactos Municipalidad El Quisco</p>
        <p style="font-size: 12px; color: #666;">Este es un correo automático, favor no responder.</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendUserEmailChanged = async (email: string, name: string) => {
  const message = {
    from: `Directorio Contactos Municipalidad El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Cambio de Email de Usuario - Directorio Contactos`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Actualización de Email de Usuario</h2>
        <p>Hola ${name},</p>
        <p>Te informamos que tu email en la plataforma ha sido actualizado por un administrador.</p>
        <p><strong>Nuevo email:</strong> ${email}</p>
        <p>Este cambio puede afectar el acceso que tienes a ciertas funcionalidades de la plataforma.</p>
        <p>Si no reconoces este cambio o tienes dudas al respecto, contacta al administrador del sistema.</p>
        <p>Saludos,<br>Sistema Directorio Contactos Municipalidad El Quisco</p>
        <p style="font-size: 12px; color: #666;">Este es un correo automático, favor no responder.</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendUserRoleChanged = async (
  email: string,
  name: string,
  rol: string
) => {
  const message = {
    from: `Directorio Contactos Municipalidad El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Cambio de Rol de Usuario - Directorio Contactos Municipalidad El Quisco`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Actualización de Rol de Usuario</h2>
        <p>Hola ${name},</p>
        <p>Te informamos que tu rol en la plataforma ha sido actualizado por un administrador.</p>
        <p>
          <strong>Nuevo rol:</strong> ${rol}
        </p>
        <p>Este cambio puede afectar el acceso que tienes a ciertas funcionalidades de la plataforma.</p>
        <p>Si no reconoces este cambio o tienes dudas al respecto, contacta al administrador del sistema.</p>
        <p>Saludos,<br>Sistema Directorio Contactos Municipalidad El Quisco</p>
        <p style="font-size: 12px; color: #666;">Este es un correo automático, favor no responder.</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendPasswordChangedByAdmin = async (
  email: string,
  name: string,
  username: string,
  newPassword: string
) => {
  const message = {
    from: `Directorio Contactos Municipalidad El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Contraseña Modificada por Administrador - Directorio Contactos",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Contraseña Modificada por Administrador</h2>
        <p>Hola ${name},</p>
        <p>Te informamos que un administrador ha modificado tu contraseña en la plataforma de Directorio Contactos Municipalidad El Quisco.</p>
        
        <div style="background: #f1f1f1; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold;">Tus nuevas credenciales:</p>
          <p><strong>Usuario:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Nueva contraseña:</strong> ${newPassword}</p>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #856404;"><strong>Importante:</strong></p>
          <ul style="margin: 10px 0; color: #856404;">
            <li>Por motivos de seguridad, te recomendamos cambiar esta contraseña inmediatamente.</li>
            <li>Puedes cambiar tu contraseña en la ventana de inicio de sesión usando la opción "¿Olvidaste tu contraseña?"</li>
            <li>Si no solicitaste este cambio, contacta al administrador del sistema inmediatamente.</li>
          </ul>
        </div>

        <p>Puedes acceder a la plataforma en: <a href="https://contactos.elquisco.cl">contactos.elquisco.cl</a></p>

        <p>Saludos,<br>Sistema Directorio Contactos Municipalidad El Quisco</p>
        <p style="font-size: 12px; color: #666;">Este es un correo automático, favor no responder.</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};
