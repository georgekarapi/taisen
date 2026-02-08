import { Transaction } from '@mysten/sui/transactions'
import { useGames } from './useGames'
import { useWallet } from './useWallet'

const CREATION_FEE_MIST = 1_000_000_000n // 1 SUI

/**
 * Build a create_tournament Transaction (pure function, testable without wallet)
 */
export function buildCreateTournamentTx(
    params: {
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
        sponsorAmount: bigint
    },
    packageId: string,
    platformConfigId: string,
    gameRegistryId: string,
): Transaction {
    const tx = new Transaction()

    const totalPayment = CREATION_FEE_MIST + params.sponsorAmount
    const [paymentCoin] = tx.splitCoins(tx.gas, [totalPayment])

    tx.moveCall({
        target: `${packageId}::tournament::create_tournament`,
        arguments: [
            tx.object(platformConfigId),
            tx.object(gameRegistryId),
            tx.pure.string(params.name),
            tx.pure.bool(params.isRemote),
            tx.pure.string(params.venueAddress),
            tx.pure.string(params.venueCity),
            tx.pure.string(params.venueCountry),
            tx.pure.u64(params.date),
            tx.pure.string(params.gameType),
            tx.pure.string(params.description),
            tx.pure.u64(params.entryFee),
            tx.pure.u64(params.gmFeeBps),
            paymentCoin,
        ],
    })

    return tx
}

// Cache for tournaments
const CACHE_TTL = 30_000 // 30 seconds

/**
 * Parse raw Sui object data to Tournament interface
 */
function parseTournament(obj: any): Tournament {
    const fields = obj.data?.content?.fields || obj.content?.fields || {}

    return {
        id: obj.data?.objectId || obj.objectId || '',
        name: fields.name || '',
        isRemote: fields.is_remote ?? true,
        venueAddress: fields.venue_address || '',
        venueCity: fields.venue_city || '',
        venueCountry: fields.venue_country || '',
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
        matches: [] // Populated by fetchTournament or specialized loader
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

    // Simplified stable countdown for SSR/Initialization
    const tournamentDate = new Date(tournament.date)
    const countdown = tournamentDate.toISOString().split('T')[0]

    const defaultBanner = '/images/banners/default.webp'

    return {
        id: tournament.id,
        title: tournament.name,
        game: game?.title || tournament.gameType,
        image: (game?.banner ?? defaultBanner) as string,
        status: displayStatus,
        prizepool: formatSui(totalPool),
        teams: `${tournament.participants.length}`,
        countdown: countdown || '',
        statusColor,
        iconColor,
        entryFee: formatSui(tournament.entryFee),
        sponsorPool: formatSui(tournament.sponsorPool),
        participants: tournament.participants,
        gameMaster: tournament.gameMaster,
        description: tournament.description,
        isRemote: tournament.isRemote,
        venueAddress: tournament.venueAddress,
        venueCity: tournament.venueCity,
        venueCountry: tournament.venueCountry,
        date: tournamentDate,
    }
}

export function useTournaments() {
    const { client, packageId, platformConfigId, gameRegistryId } = useSuiClient()
    const { activeWallet, account } = useWallet()

    const tournamentsCache = useState<Tournament[]>('tournaments_cache', () => [])
    const lastFetch = useState<number>('tournaments_last_fetch', () => 0)

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

            // 1. Fetch Tournament Object
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

            // 2. Parse basic tournament data
            const tournament = parseTournament(response)

            // 3. Fetch Matches (Dynamic Fields)
            const matchObjectIds: string[] = []
            let cursor = null
            let hasNextPage = true

            // Fetch all dynamic fields
            while (hasNextPage) {
                const fieldsResponse: any = await client.getDynamicFields({
                    parentId: objectId,
                    cursor,
                })

                fieldsResponse.data.forEach((field: any) => {
                    // Filter for Match type (key is u64)
                    if (field.name.type === 'u64') {
                        matchObjectIds.push(field.objectId)
                    }
                })

                hasNextPage = fieldsResponse.hasNextPage
                cursor = fieldsResponse.nextCursor
            }

            if (matchObjectIds.length > 0) {
                // Fetch match objects in chunks of 50
                const matches: any[] = []
                const chunkSize = 50

                for (let i = 0; i < matchObjectIds.length; i += chunkSize) {
                    const chunk = matchObjectIds.slice(i, i + chunkSize)
                    const matchesResponse = await client.multiGetObjects({
                        ids: chunk,
                        options: { showContent: true }
                    })

                    matchesResponse.forEach((m: any) => {
                        if (m.data?.content?.fields) {
                            const fields = m.data.content.fields
                            matches.push({
                                matchId: Number(fields.match_id),
                                round: Number(fields.round),
                                playerA: fields.player_a || null,
                                playerB: fields.player_b || null,
                                winner: fields.winner || null,
                                status: Number(fields.status),
                                nextMatchId: fields.next_match_id ? Number(fields.next_match_id) : null,
                                nextMatchSlot: Number(fields.next_match_slot)
                            })
                        }
                    })
                }

                // Sort matches by ID
                matches.sort((a, b) => a.matchId - b.matchId)
                tournament.matches = matches
            }

            return tournament
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
     * Uses batch fetching: collect IDs from events, then multiGetObjects
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

            // Step 1: Collect all tournament IDs from creation events
            const tournamentIds: string[] = []
            let cursor: any = undefined

            do {
                const response: any = await client.queryEvents({
                    query: {
                        MoveEventType: `${packageId}::tournament::TournamentCreated`,
                    },
                    cursor,
                    limit: 50,
                })

                for (const event of response.data) {
                    const eventData = event.parsedJson as any
                    if (eventData?.tournament_id) {
                        tournamentIds.push(eventData.tournament_id)
                    }
                }

                cursor = response.hasNextPage ? response.nextCursor : undefined
            } while (cursor)

            // Step 2: Batch fetch all tournament objects
            const allTournaments: Tournament[] = []
            const chunkSize = 50

            for (let i = 0; i < tournamentIds.length; i += chunkSize) {
                const chunk = tournamentIds.slice(i, i + chunkSize)
                const objects = await client.multiGetObjects({
                    ids: chunk,
                    options: { showContent: true, showOwner: true }
                })

                for (const obj of objects) {
                    if (obj.data?.content) {
                        allTournaments.push(parseTournament(obj))
                    }
                }
            }

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

    /**
     * Create a new tournament on-chain
     */
    async function createTournament(params: {
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
        sponsorAmount: bigint
    }): Promise<boolean> {
        if (!activeWallet.value) {
            error.value = 'Wallet not connected'
            return false
        }

        try {
            loading.value = true
            error.value = null

            const tx = buildCreateTournamentTx(params, packageId, platformConfigId, gameRegistryId)

            const features = activeWallet.value.features as any
            if (!features['sui:signAndExecuteTransaction']) {
                throw new Error('Wallet does not support transaction execution')
            }

            const { network } = useSuiClient()
            const chain = `sui:${network}`

            if (!account.value) {
                throw new Error('No active account')
            }

            await features['sui:signAndExecuteTransaction'].signAndExecuteTransaction({
                transaction: tx,
                account: account.value,
                chain,
            })

            await refresh()
            return true
        } catch (err: any) {
            console.error('Failed to create tournament:', err)
            error.value = err.message || 'Failed to create tournament'
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * Report the result of a single match
     */
    async function reportMatchResult(tournamentId: string, matchId: number, winnerAddress: string): Promise<boolean> {
        if (!activeWallet.value) {
            error.value = 'Wallet not connected'
            return false
        }

        try {
            loading.value = true
            error.value = null

            const tx = new Transaction()
            const { platformConfigId } = useSuiClient()

            tx.moveCall({
                target: `${packageId}::tournament::report_match_result`,
                arguments: [
                    tx.object(tournamentId),
                    tx.object(platformConfigId),
                    tx.pure.u64(matchId),
                    tx.pure.address(winnerAddress)
                ]
            })

            const features = activeWallet.value.features as any
            const { network } = useSuiClient()
            const chain = `sui:${network}`

            if (!account.value) throw new Error('No active account')

            await features['sui:signAndExecuteTransaction'].signAndExecuteTransaction({
                transaction: tx,
                account: account.value,
                chain,
            })

            await refresh()
            return true
        } catch (err: any) {
            console.error('Failed to report match result:', err)
            error.value = err.message || 'Failed to report match result'
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
        createTournament,
        reportMatchResult,
    }
}
