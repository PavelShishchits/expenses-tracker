export type HttpError = Error & { statusCode: number }

export function makeHttpError(message: string, statusCode: number): HttpError {
  const err = new Error(message) as HttpError
  err.statusCode = statusCode
  return err
}

export function isHttpError(err: unknown): err is HttpError {
  return err instanceof Error && typeof (err as HttpError).statusCode === 'number'
}
