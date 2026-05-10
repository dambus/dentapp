const missingEnvMessage = (name: string) =>
  `Missing required frontend environment variable: ${name}. Add it to .env.local for local development.`

export const getRequiredPublicEnv = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(missingEnvMessage(name))
  }

  return value
}
