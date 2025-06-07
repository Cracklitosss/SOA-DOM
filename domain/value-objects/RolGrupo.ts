export enum RolGrupo {
  MIEMBRO = 'MIEMBRO',
  MODERADOR = 'MODERADOR',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

export class RolGrupoVO {
  private readonly value: RolGrupo;

  private constructor(rol: RolGrupo) {
    this.value = rol;
  }

  public static of(rol: string): RolGrupoVO {
    switch (rol.toUpperCase()) {
      case RolGrupo.MIEMBRO:
      case RolGrupo.MODERADOR:
      case RolGrupo.ADMINISTRADOR:
        return new RolGrupoVO(rol.toUpperCase() as RolGrupo);
      default:
        throw new Error(`Rol de grupo inválido: ${rol}`);
    }
  }

  public getValue(): RolGrupo {
    return this.value;
  }

  public isAdministrador(): boolean {
    return this.value === RolGrupo.ADMINISTRADOR;
  }

  public isModerador(): boolean {
    return this.value === RolGrupo.MODERADOR || this.value === RolGrupo.ADMINISTRADOR;
  }
} 