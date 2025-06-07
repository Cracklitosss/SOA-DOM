export enum PrivacidadGrupo {
  PUBLICO = 'PUBLICO',
  CERRADO = 'CERRADO',
  SECRETO = 'SECRETO'
}

export class PrivacidadGrupoVO {
  private readonly value: PrivacidadGrupo;

  private constructor(privacidad: PrivacidadGrupo) {
    this.value = privacidad;
  }

  public static of(privacidad: string): PrivacidadGrupoVO {
    switch (privacidad.toUpperCase()) {
      case PrivacidadGrupo.PUBLICO:
      case PrivacidadGrupo.CERRADO:
      case PrivacidadGrupo.SECRETO:
        return new PrivacidadGrupoVO(privacidad.toUpperCase() as PrivacidadGrupo);
      default:
        throw new Error(`Privacidad de grupo inválida: ${privacidad}`);
    }
  }

  public getValue(): PrivacidadGrupo {
    return this.value;
  }
} 