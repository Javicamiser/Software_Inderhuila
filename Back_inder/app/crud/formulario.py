from app.models.formulario import RespuestaGrupo, FormularioRespuesta

def crear_grupo(db, historia_id, formulario_id):
    grupo = RespuestaGrupo(
        historia_clinica_id=historia_id,
        formulario_id=formulario_id
    )
    db.add(grupo)
    db.commit()
    db.refresh(grupo)
    return grupo

def guardar_respuesta(db, grupo_id, campo, valor):
    r = FormularioRespuesta(
        grupo_id=grupo_id,
        campo=campo,
        valor=valor
    )
    db.add(r)
