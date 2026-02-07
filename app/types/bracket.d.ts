/**
 * Tournament Bracket Types
 * State-driven filtering system for responsive bracket display
 */

/** Player status within matches */
type BracketPlayerStatus = 'winner' | 'loser' | 'playing' | 'pending'

/** Match status */
type BracketMatchStatus = 'completed' | 'in_progress' | 'pending'

/** Player in a bracket match */
interface BracketPlayer {
    id: string
    name: string
    avatar?: string
    score: number
    status: BracketPlayerStatus
}

/** A single match in the bracket */
interface BracketMatch {
    id: string
    roundId: string
    matchNumber: number
    players: [BracketPlayer | null, BracketPlayer | null]
    status: BracketMatchStatus
    nextMatchId?: string
}

/** A round in the tournament bracket */
interface BracketRound {
    id: string
    label: string
    roundIndex: number
    isActive: boolean
    isDisabled?: boolean
}

/** Overall bracket state */
interface BracketState {
    rounds: BracketRound[]
    matches: BracketMatch[]
    activeRoundId: string
}
