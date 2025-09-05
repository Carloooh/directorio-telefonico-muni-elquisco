DROP TABLE usuarios_numeros_rel;
DROP TABLE usuarios_numeros;
DROP TABLE numeros;
DROP TABLE usuarios;

CREATE TABLE numeros (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    numero varchar(12) NOT NULL UNIQUE,
    tipo varchar(5) NOT NULL,
    direccion varchar(50),
    unidad varchar(50),
    ubicacion varchar(50)
);

CREATE TABLE usuarios_numeros (
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
nombre varchar(50) NOT NULL,
cargo varchar(50)
);

CREATE TABLE usuarios_numeros_rel (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    id_usuario UNIQUEIDENTIFIER FOREIGN KEY REFERENCES usuarios_numeros(id) ON DELETE SET NULL,
    id_numero UNIQUEIDENTIFIER FOREIGN KEY REFERENCES numeros(id) ON DELETE SET NULL,
);

CREATE TABLE usuarios (
	id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    usuario varchar(50) NOT NULL UNIQUE,
    contraseña varchar(100) NOT NULL,
    nombre varchar(100) NOT NULL,
	email varchar(100) NOT NULL UNIQUE,
    rol varchar(50),
	estado VARCHAR(20) NOT NULL CHECK (estado IN ('Activa', 'Inactiva')),
	codigo_temporal varchar(6),
	fecha_expiracion_codigo_temporal datetime2,
);

DROP INDEX IX_rel_id_usuario ON usuarios_numeros_rel;
DROP INDEX IX_rel_id_numero ON usuarios_numeros_rel;

CREATE INDEX IX_rel_id_usuario ON usuarios_numeros_rel(id_usuario);
CREATE INDEX IX_rel_id_numero ON usuarios_numeros_rel(id_numero);

insert into usuarios (usuario, contraseña, nombre, email, rol, estado) values ('cazocar', '$2b$12$OcAPVXQrAoM5lY4p/yV2bOX3Xf/WlHijPvuJU5t6pvZemocJqM7ly', 'Carlos Azocar',	'cazocar@elquisco.cl', 'Administrador',	'Activa');
