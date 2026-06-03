/** Application error with HTTP status code and machine-readable code. */
export class AppError extends Error {
  /** Creates an error tied to a specific HTTP response. */
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
  }
}
