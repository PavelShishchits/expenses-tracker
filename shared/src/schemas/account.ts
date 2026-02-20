import { z } from 'zod'

export const inviteSchema = z.object({
  email: z.string().email(),
})

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
})

export type InviteInput = z.infer<typeof inviteSchema>
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>
