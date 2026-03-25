"""
Servicio para envío de correos electrónicos
INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila
"""
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from io import BytesIO
from typing import Optional


# Configuración SMTP - Usar variables de entorno o valores por defecto
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")  # Para Gmail: usar contraseña de aplicación
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "INDERHUILA - Sistema de Historias Clínicas")


def enviar_email_con_pdf(
    destinatario: str,
    asunto: str,
    cuerpo_html: str,
    pdf_buffer: BytesIO,
    nombre_pdf: str,
    cuerpo_texto: Optional[str] = None
) -> dict:
    """
    Envía un correo electrónico con un PDF adjunto
    
    Args:
        destinatario: Email del destinatario
        asunto: Asunto del correo
        cuerpo_html: Contenido HTML del correo
        pdf_buffer: BytesIO con el PDF generado
        nombre_pdf: Nombre del archivo PDF adjunto
        cuerpo_texto: Versión texto plano del correo (opcional)
    
    Returns:
        dict con success (bool) y message (str)
    """
    try:
        # Validar configuración
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            return {
                "success": False,
                "message": "Configuración de email no establecida. Configure las variables de entorno SMTP_USERNAME y SMTP_PASSWORD."
            }
        
        # Crear mensaje
        msg = MIMEMultipart('mixed')
        msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL or SMTP_USERNAME}>"
        msg['To'] = destinatario
        msg['Subject'] = asunto
        
        # Crear parte alternativa para texto y HTML
        msg_alternative = MIMEMultipart('alternative')
        
        # Agregar versión texto plano
        if cuerpo_texto:
            parte_texto = MIMEText(cuerpo_texto, 'plain', 'utf-8')
            msg_alternative.attach(parte_texto)
        
        # Agregar versión HTML
        parte_html = MIMEText(cuerpo_html, 'html', 'utf-8')
        msg_alternative.attach(parte_html)
        
        msg.attach(msg_alternative)
        
        # Adjuntar PDF
        pdf_buffer.seek(0)
        adjunto = MIMEBase('application', 'pdf')
        adjunto.set_payload(pdf_buffer.read())
        encoders.encode_base64(adjunto)
        adjunto.add_header(
            'Content-Disposition',
            f'attachment; filename="{nombre_pdf}"'
        )
        msg.attach(adjunto)
        
        # Enviar correo
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        return {
            "success": True,
            "message": f"Correo enviado exitosamente a {destinatario}"
        }
    
    except smtplib.SMTPAuthenticationError:
        return {
            "success": False,
            "message": "Error de autenticación. Verifique las credenciales SMTP."
        }
    except smtplib.SMTPRecipientsRefused:
        return {
            "success": False,
            "message": f"El destinatario {destinatario} fue rechazado."
        }
    except smtplib.SMTPException as e:
        return {
            "success": False,
            "message": f"Error SMTP: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error al enviar correo: {str(e)}"
        }


def generar_html_historia_clinica(
    deportista_nombre: str,
    deportista_documento: str,
    fecha_apertura: str,
    historia_id: str
) -> str:
    """
    Genera el contenido HTML del correo para historia clínica
    
    Args:
        deportista_nombre: Nombre completo del deportista
        deportista_documento: Número de documento
        fecha_apertura: Fecha de apertura de la historia
        historia_id: ID de la historia clínica
    
    Returns:
        str: Contenido HTML del correo
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .header p {{
                margin: 5px 0 0 0;
                opacity: 0.9;
                font-size: 14px;
            }}
            .content {{
                background: #f8fafc;
                padding: 30px;
                border: 1px solid #e2e8f0;
            }}
            .info-box {{
                background: white;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #1e40af;
            }}
            .info-box h3 {{
                margin-top: 0;
                color: #1e40af;
            }}
            .info-item {{
                display: flex;
                margin: 10px 0;
            }}
            .info-label {{
                font-weight: bold;
                width: 150px;
                color: #64748b;
            }}
            .info-value {{
                color: #1e293b;
            }}
            .footer {{
                background: #1e293b;
                color: #94a3b8;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                border-radius: 0 0 10px 10px;
            }}
            .footer a {{
                color: #60a5fa;
            }}
            .attachment-notice {{
                background: #ecfdf5;
                border: 1px solid #10b981;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
            }}
            .attachment-notice span {{
                color: #059669;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏥 Historia Clínica Deportiva</h1>
            <p>INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila</p>
        </div>
        
        <div class="content">
            <p>Estimado(a) <strong>{deportista_nombre}</strong>,</p>
            
            <p>Adjunto a este correo encontrará su historia clínica deportiva en formato PDF.</p>
            
            <div class="info-box">
                <h3>📋 Datos de la Historia</h3>
                <div class="info-item">
                    <span class="info-label">Documento:</span>
                    <span class="info-value">{deportista_documento}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de apertura:</span>
                    <span class="info-value">{fecha_apertura}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">ID Historia:</span>
                    <span class="info-value">{historia_id}</span>
                </div>
            </div>
            
            <div class="attachment-notice">
                📎 <span>Archivo adjunto:</span> historia_clinica_{deportista_documento}.pdf
            </div>
            
            <p>Este documento contiene información médica confidencial. Por favor, manéjelo con la debida reserva.</p>
            
            <p>Si tiene alguna pregunta o necesita información adicional, no dude en comunicarse con nosotros.</p>
        </div>
        
        <div class="footer">
            <p><strong>INDERHUILA</strong></p>
            <p>Instituto Departamental de Recreación y Deportes del Huila</p>
            <p>Este es un correo automático generado por el Sistema de Historias Clínicas</p>
        </div>
    </body>
    </html>
    """


def generar_texto_plano_historia_clinica(
    deportista_nombre: str,
    deportista_documento: str,
    fecha_apertura: str,
    historia_id: str
) -> str:
    """
    Genera el contenido en texto plano del correo para historia clínica
    """
    return f"""
HISTORIA CLÍNICA DEPORTIVA
INDERHUILA - Instituto Departamental de Recreación y Deportes del Huila
================================================================

Estimado(a) {deportista_nombre},

Adjunto a este correo encontrará su historia clínica deportiva en formato PDF.

DATOS DE LA HISTORIA:
- Documento: {deportista_documento}
- Fecha de apertura: {fecha_apertura}
- ID Historia: {historia_id}

Este documento contiene información médica confidencial. 
Por favor, manéjelo con la debida reserva.

Si tiene alguna pregunta o necesita información adicional, 
no dude en comunicarse con nosotros.

--
INDERHUILA
Instituto Departamental de Recreación y Deportes del Huila
Sistema de Historias Clínicas
    """