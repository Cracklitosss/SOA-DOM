export enum PrivacidadEvento {
  PUBLICO = 'PUBLICO',
  PRIVADO = 'PRIVADO',
  SOLO_INVITADOS = 'SOLO_INVITADOS'
}

export class PrivacidadEventoVO {
  private readonly value: PrivacidadEvento;

  private constructor(privacidad: PrivacidadEvento) {
    this.value = privacidad;
  }

  public static of(privacidad: string): PrivacidadEventoVO {
    switch (privacidad.toUpperCase()) {
      case PrivacidadEvento.PUBLICO:
      case PrivacidadEvento.PRIVADO:
      case PrivacidadEvento.SOLO_INVITADOS:
        return new PrivacidadEventoVO(privacidad.toUpperCase() as PrivacidadEvento);
      default:
        throw new Error(`Privacidad de evento inválida: ${privacidad}`);
    }
  }

  public getValue(): PrivacidadEvento {
    return this.value;
  }
} 