export enum EstadoAsistencia {
  ASISTIRA = 'ASISTIRA',
  INTERESADO = 'INTERESADO',
  NO_ASISTIRA = 'NO_ASISTIRA',
  SIN_RESPUESTA = 'SIN_RESPUESTA'
}

export class EstadoAsistenciaVO {
  private readonly value: EstadoAsistencia;

  private constructor(estado: EstadoAsistencia) {
    this.value = estado;
  }

  public static of(estado: string): EstadoAsistenciaVO {
    switch (estado.toUpperCase()) {
      case EstadoAsistencia.ASISTIRA:
      case EstadoAsistencia.INTERESADO:
      case EstadoAsistencia.NO_ASISTIRA:
      case EstadoAsistencia.SIN_RESPUESTA:
        return new EstadoAsistenciaVO(estado.toUpperCase() as EstadoAsistencia);
      default:
        throw new Error(`Estado de asistencia inválido: ${estado}`);
    }
  }

  public getValue(): EstadoAsistencia {
    return this.value;
  }

  public isAsistira(): boolean {
    return this.value === EstadoAsistencia.ASISTIRA;
  }
} 