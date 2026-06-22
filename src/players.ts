export type Player = {
  id: string
  name: string
  email: string
}

export const PLAYERS: Player[] = [
  { id: 'yonatan', name: 'יהונתן', email: 'moshe.hoffman@gmail.com' },
  { id: 'guy', name: 'גיא', email: 'tirza01@hotmail.com' },
]

export const DEFAULT_PLAYER: Player = PLAYERS[0]

export function findPlayer(id: string | null): Player {
  if (!id) return DEFAULT_PLAYER
  return PLAYERS.find((p) => p.id === id) ?? DEFAULT_PLAYER
}
