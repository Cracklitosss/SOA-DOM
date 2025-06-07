import { GrupoRepository } from '../../domain/repositories/GrupoRepository';
import { Grupo } from '../../domain/aggregates/Grupo';
import { MiembroGrupo, PublicacionGrupo } from '../../domain/entities';
import { 
  GrupoId, 
  UsuarioId, 
  PrivacidadGrupoVO, 
  RolGrupoVO 
} from '../../domain/value-objects';
import { Database } from '../config/database';

export class MySQLGrupoRepository implements GrupoRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(grupo: Grupo): Promise<void> {
    // Transacción para guardar el grupo y sus miembros
    const connection = await this.db.getPool().getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Guardar el grupo
      const grupoQuery = `
        INSERT INTO grupos (id, nombre, descripcion, creador_id, privacidad, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nombre = VALUES(nombre),
          descripcion = VALUES(descripcion),
          privacidad = VALUES(privacidad)
      `;
      
      await connection.execute(grupoQuery, [
        grupo.id.getValue(),
        grupo.nombre,
        grupo.descripcion,
        grupo.creadorId.getValue(),
        grupo.privacidad.getValue(),
        grupo.fechaCreacion
      ]);
      
      // Eliminar miembros existentes para reinsertarlos
      await connection.execute(
        'DELETE FROM miembros_grupo WHERE grupo_id = ?',
        [grupo.id.getValue()]
      );
      
      // Insertar miembros actualizados
      for (const miembro of grupo.miembros) {
        const miembroQuery = `
          INSERT INTO miembros_grupo (grupo_id, usuario_id, rol, fecha_union)
          VALUES (?, ?, ?, ?)
        `;
        
        await connection.execute(miembroQuery, [
          miembro.grupoId.getValue(),
          miembro.usuarioId.getValue(),
          miembro.rol.getValue(),
          miembro.fechaUnion
        ]);
      }
      
      // Eliminar publicaciones existentes para reinsertarlas
      await connection.execute(
        'DELETE FROM publicaciones_grupo WHERE grupo_id = ?',
        [grupo.id.getValue()]
      );
      
      // Insertar publicaciones actualizadas
      for (const publicacion of grupo.publicaciones) {
        const publicacionQuery = `
          INSERT INTO publicaciones_grupo (id, grupo_id, autor_id, contenido, fecha_creacion, aprobada)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        await connection.execute(publicacionQuery, [
          publicacion.id,
          publicacion.grupoId.getValue(),
          publicacion.autorId.getValue(),
          publicacion.contenido,
          publicacion.fechaCreacion,
          publicacion.aprobada
        ]);
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error('Error al guardar grupo:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async findById(id: GrupoId): Promise<Grupo | null> {
    const query = 'SELECT * FROM grupos WHERE id = ?';
    const result = await this.db.query(query, [id.getValue()]);
    
    if (!result || result.length === 0) {
      return null;
    }
    
    const grupo = this.mapToEntity(result[0]);
    
    // Cargar miembros
    const miembrosQuery = 'SELECT * FROM miembros_grupo WHERE grupo_id = ?';
    const miembrosResult = await this.db.query(miembrosQuery, [id.getValue()]);
    
    const miembros = miembrosResult.map(this.mapToMiembroEntity.bind(this));
    
    // El grupo ya tiene al creador como miembro, así que evitamos duplicados
    const miembrosUnicos = miembros.filter(
      (m: MiembroGrupo) => !grupo.miembros.some(
        (gm: MiembroGrupo) => gm.usuarioId.getValue() === m.usuarioId.getValue()
      )
    );
    
    miembrosUnicos.forEach((m: MiembroGrupo) => {
      grupo.miembros.push(m);
    });
    
    return grupo;
  }

  async findByIdWithMiembros(id: GrupoId): Promise<Grupo | null> {
    const grupo = await this.findById(id);
    
    if (!grupo) {
      return null;
    }
    
    // Cargar publicaciones
    const publicacionesQuery = 'SELECT * FROM publicaciones_grupo WHERE grupo_id = ?';
    const publicacionesResult = await this.db.query(publicacionesQuery, [id.getValue()]);
    
    const publicaciones = publicacionesResult.map(this.mapToPublicacionEntity.bind(this));
    
    publicaciones.forEach((p: PublicacionGrupo) => {
      grupo.publicaciones.push(p);
    });
    
    return grupo;
  }

  async findByUsuario(usuarioId: UsuarioId): Promise<Grupo[]> {
    const query = `
      SELECT g.* FROM grupos g
      JOIN miembros_grupo m ON g.id = m.grupo_id
      WHERE m.usuario_id = ?
    `;
    
    const result = await this.db.query(query, [usuarioId.getValue()]);
    
    if (!result || result.length === 0) {
      return [];
    }
    
    const grupos = result.map(this.mapToEntity.bind(this));
    
    // Cargar miembros para cada grupo
    for (let grupo of grupos) {
      const miembrosQuery = 'SELECT * FROM miembros_grupo WHERE grupo_id = ?';
      const miembrosResult = await this.db.query(miembrosQuery, [grupo.id.getValue()]);
      
      const miembros = miembrosResult.map(this.mapToMiembroEntity.bind(this));
      
      miembros.forEach((m: MiembroGrupo) => {
        if (!grupo.miembros.some((gm: MiembroGrupo) => gm.usuarioId.getValue() === m.usuarioId.getValue())) {
          grupo.miembros.push(m);
        }
      });
    }
    
    return grupos;
  }

  async delete(id: GrupoId): Promise<void> {
    // Las eliminaciones en cascada están configuradas en la base de datos
    const query = 'DELETE FROM grupos WHERE id = ?';
    await this.db.query(query, [id.getValue()]);
  }

  async findAll(limit?: number, offset?: number): Promise<Grupo[]> {
    let query = 'SELECT * FROM grupos';
    
    if (limit !== undefined) {
      query += ' LIMIT ?';
      
      if (offset !== undefined) {
        query += ' OFFSET ?';
      }
    }
    
    let params: any[] = [];
    
    if (limit !== undefined) {
      params.push(limit);
      
      if (offset !== undefined) {
        params.push(offset);
      }
    }
    
    const result = await this.db.query(query, params);
    
    if (!result || result.length === 0) {
      return [];
    }
    
    return result.map(this.mapToEntity.bind(this));
  }

  async countTotal(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM grupos';
    const result = await this.db.query(query);
    
    return result[0].count;
  }

  // Funciones de mapeo
  private mapToEntity(data: any): Grupo {
    const id = GrupoId.of(data.id);
    const creadorId = UsuarioId.of(data.creador_id);
    const privacidad = PrivacidadGrupoVO.of(data.privacidad);
    
    return new Grupo(
      id,
      data.nombre,
      data.descripcion,
      creadorId,
      privacidad,
      new Date(data.fecha_creacion)
    );
  }

  private mapToMiembroEntity(data: any): MiembroGrupo {
    const grupoId = GrupoId.of(data.grupo_id);
    const usuarioId = UsuarioId.of(data.usuario_id);
    const rol = RolGrupoVO.of(data.rol);
    
    return new MiembroGrupo(
      grupoId,
      usuarioId,
      rol,
      new Date(data.fecha_union)
    );
  }

  private mapToPublicacionEntity(data: any): PublicacionGrupo {
    const grupoId = GrupoId.of(data.grupo_id);
    const autorId = UsuarioId.of(data.autor_id);
    
    return new PublicacionGrupo(
      grupoId,
      autorId,
      data.contenido,
      data.id,
      new Date(data.fecha_creacion),
      Boolean(data.aprobada)
    );
  }
} 