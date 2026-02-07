import { Transaction } from '@mysten/sui/transactions'
import { useGames } from './useGames'
import { useWallet } from './useWallet'

// Cache for tournaments
const tournamentsCache = ref<Tournament[]>([])
const lastFetch = ref<number>(0)
const CACHE_TTL = 30_000 // 30 seconds

/**
 * Parse raw Sui object data to Tournament interface
 */
function parseTournament(obj: any): Tournament {
    const fields = obj.data?.content?.fields || obj.content?.fields || {}

    return {
        id: obj.data?.objectId || obj.objectId || '',
        name: fields.name || '',
        location: fields.location || '',
        date: Number(fields.date || 0),
        gameType: fields.game_type || '',
        description: fields.description || '',
        entryFee: BigInt(fields.entry_fee || 0),
        gmFeeBps: Number(fields.gm_fee_bps || 0),
        sponsorPool: BigInt(fields.sponsor_pool?.fields?.balance || fields.sponsor_pool || 0),
        playerPool: BigInt(fields.player_pool?.fields?.balance || fields.player_pool || 0),
        participants: fields.participants || [],
        status: Number(fields.status || 0) as TournamentStatus,
        winner: fields.winner || null,
        gameMaster: fields.game_master || '',
        currentRound: Number(fields.current_round || 0),
        totalRounds: Number(fields.total_rounds || 0),
    }
}

/**
 * Convert Tournament to display format for UI components
 */
function toDisplayFormat(tournament: Tournament): TournamentDisplay {
    const { games } = useGames()
    const game = games.find(g => g.slug === tournament.gameType)

    const displayStatus = getDisplayStatus(tournament.status, tournament.date)
    const totalPool = tournament.sponsorPool + tournament.playerPool

    const statusColors: Record<string, { statusColor: string; iconColor: string }> = {
        'LIVE': { statusColor: 'cyber-red', iconColor: 'text-cyber-red' },
        'UPCOMING': { statusColor: 'cyber-cyan', iconColor: 'text-cyber-cyan' },
        'ENDED': { statusColor: 'cyber-purple', iconColor: 'text-gray-500' },
    }

    const colors = statusColors[displayStatus] || statusColors['ENDED']!
    const { statusColor, iconColor } = colors as { statusColor: string; iconColor: string }

    // Format countdown/time display
    let countdown: string
    const tournamentDate = new Date(tournament.date)
    const now = Date.now()

    if (displayStatus === 'LIVE') {
        countdown = 'Tournament in progress'
    } else if (displayStatus === 'UPCOMING') {
        const diff = tournament.date - now
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        if (hours > 24) {
            countdown = tournamentDate.toLocaleDateString()
        } else {
            countdown = `Starts in ${hours}h ${minutes}m`
        }
    } else {
        countdown = tournamentDate.toLocaleDateString()
    }

    const defaultBanner = '/images/banners/default.webp'

    return {
        id: tournament.id,
        title: tournament.name,
        game: game?.title || tournament.gameType,
        image: game?.banner || defaultBanner,
        status: displayStatus,
        prizepool: formatSui(totalPool),
        teams: `${tournament.participants.length}`,
        countdown,
        statusColor,
        iconColor,
        entryFee: formatSui(tournament.entryFee),
        sponsorPool: formatSui(tournament.sponsorPool),
        participants: tournament.participants,
        gameMaster: tournament.gameMaster,
        description: tournament.description,
        location: tournament.location,
        date: tournamentDate,
    }
}

export function useTournaments() {
    const { client, packageId } = useSuiClient()
    const { activeWallet, account } = useWallet()

    const tournaments = ref<Tournament[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    /**
     * Fetch a single tournament by object ID
     */
    async function fetchTournament(objectId: string): Promise<Tournament | null> {
        try {
            loading.value = true
            error.value = null

            const response = await client.getObject({
                id: objectId,
                options: {
                    showContent: true,
                    showOwner: true,
                },
            })

            if (!response.data) {
                error.value = 'Tournament not found'
                return null
            }

            return parseTournament(response)
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch tournament'
            console.error('Failed to fetch tournament:', err)
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch all tournaments from the contract
     */
    async function fetchAllTournaments(): Promise<Tournament[]> {
        // Check cache
        if (tournamentsCache.value.length > 0 && Date.now() - lastFetch.value < CACHE_TTL) {
            tournaments.value = tournamentsCache.value
            return tournamentsCache.value
        }

        try {
            loading.value = true
            error.value = null

            // Query all Tournament type objects from the package
            const tournamentType = `${packageId}::tournament::Tournament`

            let cursor: any = undefined
            const allTournaments: Tournament[] = []

            do {
                const response: any = await client.queryEvents({
                    query: {
                        MoveEventType: `${packageId}::tournament::TournamentCreated`,
                    },
                    cursor,
                    limit: 50,
                })

                // Extract tournament IDs from creation events
                for (const event of response.data) {
                    const eventData = event.parsedJson as any
                    if (eventData?.tournament_id) {
                        try {
                            const tournament = await fetchTournament(eventData.tournament_id)
                            if (tournament) {
                                allTournaments.push(tournament)
                            }
                        } catch (err) {
                            console.warn('Failed to fetch tournament:', eventData.tournament_id, err)
                        }
                    }
                }

                cursor = response.hasNextPage ? response.nextCursor : undefined
            } while (cursor)

            // Update cache
            tournamentsCache.value = allTournaments
            lastFetch.value = Date.now()
            tournaments.value = allTournaments

            // Sort tournaments: LIVE first, then UPCOMING, then ENDED
            allTournaments.sort((a, b) => {
                const statusA = getDisplayStatus(a.status, a.date)
                const statusB = getDisplayStatus(b.status, b.date)

                const priority = { 'LIVE': 0, 'UPCOMING': 1, 'ENDED': 2 }

                if (priority[statusA] !== priority[statusB]) {
                    return priority[statusA] - priority[statusB]
                }

                // Secondary sort:
                // UPCOMING: earliest date first
                // OTHERS: latest date first (newest)
                if (statusA === 'UPCOMING') {
                    return a.date - b.date
                }
                return b.date - a.date
            })

            return allTournaments
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch tournaments'
            console.error('Failed to fetch tournaments:', err)
            return []
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch tournaments where the given address is the game master
     */
    async function fetchGameMasterTournaments(address: string): Promise<Tournament[]> {
        const all = await fetchAllTournaments()
        return all.filter(t => t.gameMaster === address)
    }

    /**
     * Fetch tournaments where the given address is registered
     */
    async function fetchRegisteredTournaments(address: string): Promise<Tournament[]> {
        const all = await fetchAllTournaments()
        return all.filter(t => t.participants.includes(address))
    }

    /**
     * Get tournaments as display format
     */
    function getDisplayTournaments(): ComputedRef<TournamentDisplay[]> {
        return computed(() => tournaments.value.map(toDisplayFormat))
    }

    /**
     * Clear cache and refetch
     */
    async function refresh(): Promise<void> {
        tournamentsCache.value = []
        lastFetch.value = 0
        await fetchAllTournaments()
    }

    /**
     * Register for a tournament
     */
    async function registerForTournament(tournamentId: string, entryFee: bigint): Promise<boolean> {
        if (!activeWallet.value) {
            error.value = 'Wallet not connected'
            return false
        }

        try {
            loading.value = true
            error.value = null

            const tx = new Transaction()

            // Handle payment if entry fee > 0
            let paymentCoin
            if (entryFee > 0n) {
                const [coin] = tx.splitCoins(tx.gas, [entryFee])
                paymentCoin = coin
            } else {
                // If free, create a zero value coin
                paymentCoin = tx.splitCoins(tx.gas, [0])[0]
            }

            tx.moveCall({
                target: `${packageId}::tournament::register`,
                arguments: [
                    tx.object(tournamentId),
                    paymentCoin
                ]
            })

            const features = activeWallet.value.features as any
            if (!features['sui:signAndExecuteTransaction']) {
                throw new Error('Wallet does not support transaction execution')
            }

            // Get current network from client config
            const { network } = useSuiClient()
            const chain = `sui:${network}`

            // Get active account
            if (!account.value) {
                throw new Error('No active account')
            }

            await features['sui:signAndExecuteTransaction'].signAndExecuteTransaction({
                transaction: tx,
                account: account.value,
                chain,
            })

            // Refresh logic handled by caller or automatic reactivity if we update local state
            // For now, let's trigger a refresh
            await refresh()
            return true
        } catch (err: any) {
            console.error('Registration failed:', err)
            error.value = err.message || 'Registration failed'
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        tournaments,
        loading,
        error,
        fetchTournament,
        fetchAllTournaments,
        fetchGameMasterTournaments,
        fetchRegisteredTournaments,
        getDisplayTournaments,
        toDisplayFormat,
        refresh,
        registerForTournament,
    }
}
