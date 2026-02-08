export enum TournamentStatus {
    OPEN = 0,
    IN_PROGRESS = 1,
    COMPLETED = 2,
    CANCELLED = 3
}

/**
 * Convert raw contract status to display status
 */
export function getDisplayStatus(status: TournamentStatus, date: number): 'LIVE' | 'UPCOMING' | 'ENDED' {
    if (status === TournamentStatus.COMPLETED || status === TournamentStatus.CANCELLED) {
        return 'ENDED'
    }
    if (status === TournamentStatus.IN_PROGRESS) {
        return 'LIVE'
    }

    // OPEN status - check if tournament has started
    // SSR Safe: On server, we treat all OPEN tournaments as UPCOMING 
    // to match the initial client pass.
    if (import.meta.server) {
        return 'UPCOMING'
    }

    const now = Date.now()
    if (date <= now) {
        return 'LIVE'
    }
    return 'UPCOMING'
}

/**
 * Format MIST to SUI display string
 */
export function formatSui(mist: bigint): string {
    const sui = Number(mist) / 1_000_000_000
    if (sui >= 1000) {
        return `${(sui / 1000).toFixed(1)}k SUI`
    }
    if (sui >= 1) {
        return `${sui.toFixed(2)} SUI`
    }
    return `${sui.toFixed(4)} SUI`
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string): string {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}
/**
 * Get standard tournament labeling for a given round
 * - Last round: "Finals"
 * - Second to last: "Semifinals" (if at least 2 rounds exist)
 * - Third to last: "Quarterfinals" (if at least 4 rounds exist)
 * - Others: "Round N" (1-indexed)
 */
export function getRoundLabel(roundIndex: number, numRounds: number): string {
    if (roundIndex === numRounds - 1) {
        return 'Finals'
    }
    if (roundIndex === numRounds - 2 && numRounds >= 2) {
        return 'Semifinals'
    }
    if (roundIndex === numRounds - 3 && numRounds >= 4) {
        return 'Quarterfinals'
    }
    return `Round ${roundIndex + 1}`
}
