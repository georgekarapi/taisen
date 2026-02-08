interface ContractMatch {
    matchId: number
    round: number
    playerA: string | null
    playerB: string | null
    winner: string | null
    status: number
    nextMatchId: number | null
    nextMatchSlot: number
}

interface Participant {
    address: string
    username: string
}

interface Tournament {
    id: string
    name: string
    isRemote: boolean
    venueAddress: string
    venueCity: string
    venueCountry: string
    date: number
    gameType: string
    description: string
    entryFee: bigint
    gmFeeBps: number
    sponsorPool: bigint
    playerPool: bigint
    participants: Participant[]
    status: TournamentStatus
    winner: string | null
    gameMaster: string
    currentRound: number
    totalRounds: number
    matches: ContractMatch[]
}


interface TournamentDisplay {
    id: string
    title: string
    game: string
    image: string
    status: 'LIVE' | 'UPCOMING' | 'ENDED'
    prizepool: string
    teams: string
    countdown: string
    statusColor: string
    iconColor: string
    entryFee: string
    sponsorPool: string
    participants: Participant[]
    gameMaster: string
    description: string
    isRemote: boolean
    venueAddress: string
    venueCity: string
    venueCountry: string
    date: Date
}
