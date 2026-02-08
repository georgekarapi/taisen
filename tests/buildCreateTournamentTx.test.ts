import { describe, it, expect } from 'vitest'
import { buildCreateTournamentTx } from '../app/composables/useTournaments'
import { Transaction } from '@mysten/sui/transactions'

// Valid-format Sui addresses (64 hex chars after 0x)
const PACKAGE_ID = '0x' + 'aa'.repeat(32)
const PLATFORM_CONFIG_ID = '0x' + 'bb'.repeat(32)
const GAME_REGISTRY_ID = '0x' + 'cc'.repeat(32)

const baseParams = {
    name: 'Test Tournament',
    isRemote: false,
    venueAddress: '123 Main St',
    venueCity: 'Test City',
    venueCountry: 'Test Country',
    date: 1700000000000,
    gameType: 'yugioh',
    description: 'A test tournament',
    entryFee: 10_000_000_000n, // 10 SUI
    gmFeeBps: 500, // 5%
    sponsorAmount: 5_000_000_000n, // 5 SUI
}

describe('buildCreateTournamentTx', () => {
    it('returns a Transaction instance', () => {
        const tx = buildCreateTournamentTx(baseParams, PACKAGE_ID, PLATFORM_CONFIG_ID, GAME_REGISTRY_ID)
        expect(tx).toBeInstanceOf(Transaction)
    })

    it('builds a transaction with SplitCoins + MoveCall commands', () => {
        const tx = buildCreateTournamentTx(baseParams, PACKAGE_ID, PLATFORM_CONFIG_ID, GAME_REGISTRY_ID)
        const data = tx.getData()

        expect(data.commands).toHaveLength(2)
        expect(data.commands[0].$kind).toBe('SplitCoins')
        expect(data.commands[1].$kind).toBe('MoveCall')
    })

    it('targets the correct contract function', () => {
        const tx = buildCreateTournamentTx(baseParams, PACKAGE_ID, PLATFORM_CONFIG_ID, GAME_REGISTRY_ID)
        const data = tx.getData()

        const moveCall = data.commands[1]
        expect(moveCall.$kind).toBe('MoveCall')

        if (moveCall.$kind === 'MoveCall') {
            expect(moveCall.MoveCall.package).toBe(PACKAGE_ID)
            expect(moveCall.MoveCall.module).toBe('tournament')
            expect(moveCall.MoveCall.function).toBe('create_tournament')
        }
    })

    it('passes exactly 13 arguments to the moveCall', () => {
        const tx = buildCreateTournamentTx(baseParams, PACKAGE_ID, PLATFORM_CONFIG_ID, GAME_REGISTRY_ID)
        const data = tx.getData()

        const moveCall = data.commands[1]
        if (moveCall.$kind === 'MoveCall') {
            // config, registry, name, is_remote, venue_address, venue_city, venue_country, date, game_type, description, entry_fee, gm_fee_bps, payment
            expect(moveCall.MoveCall.arguments).toHaveLength(13)
        }
    })

    it('splits the correct total payment (creation fee + sponsor amount)', () => {
        const tx = buildCreateTournamentTx(baseParams, PACKAGE_ID, PLATFORM_CONFIG_ID, GAME_REGISTRY_ID)
        const data = tx.getData()

        const splitCoins = data.commands[0]
        expect(splitCoins.$kind).toBe('SplitCoins')

        if (splitCoins.$kind === 'SplitCoins') {
            expect(splitCoins.SplitCoins.coin.$kind).toBe('GasCoin')
            expect(splitCoins.SplitCoins.amounts).toHaveLength(1)

            // Verify the amount input is 6 SUI (1 creation + 5 sponsor) = 6_000_000_000 MIST
            const amountRef = splitCoins.SplitCoins.amounts[0]
            if (amountRef.$kind === 'Input') {
                const input = data.inputs[amountRef.Input]
                if (input.$kind === 'Pure') {
                    const buffer = Buffer.from(input.Pure.bytes, 'base64')
                    const value = buffer.readBigUInt64LE(0)
                    expect(value).toBe(6_000_000_000n)
                }
            }
        }
    })

    it('works with zero sponsor amount (paid entry)', () => {
        const params = { ...baseParams, sponsorAmount: 0n }
        const tx = buildCreateTournamentTx(params, PACKAGE_ID, PLATFORM_CONFIG_ID, GAME_REGISTRY_ID)
        const data = tx.getData()

        const splitCoins = data.commands[0]
        if (splitCoins.$kind === 'SplitCoins') {
            const amountRef = splitCoins.SplitCoins.amounts[0]
            if (amountRef.$kind === 'Input') {
                const input = data.inputs[amountRef.Input]
                if (input.$kind === 'Pure') {
                    const buffer = Buffer.from(input.Pure.bytes, 'base64')
                    const value = buffer.readBigUInt64LE(0)
                    expect(value).toBe(1_000_000_000n) // only creation fee
                }
            }
        }
    })

    it('works with zero entry fee and nonzero sponsor (free tournament)', () => {
        const params = { ...baseParams, entryFee: 0n, sponsorAmount: 2_000_000_000n }
        const tx = buildCreateTournamentTx(params, PACKAGE_ID, PLATFORM_CONFIG_ID, GAME_REGISTRY_ID)
        const data = tx.getData()

        expect(data.commands).toHaveLength(2)

        const splitCoins = data.commands[0]
        if (splitCoins.$kind === 'SplitCoins') {
            const amountRef = splitCoins.SplitCoins.amounts[0]
            if (amountRef.$kind === 'Input') {
                const input = data.inputs[amountRef.Input]
                if (input.$kind === 'Pure') {
                    const buffer = Buffer.from(input.Pure.bytes, 'base64')
                    const value = buffer.readBigUInt64LE(0)
                    expect(value).toBe(3_000_000_000n) // 1 SUI creation + 2 SUI sponsor
                }
            }
        }
    })

    it('works with remote tournament and empty venue fields', () => {
        const params = { ...baseParams, isRemote: true, venueAddress: '', venueCity: '', venueCountry: '' }
        const tx = buildCreateTournamentTx(params, PACKAGE_ID, PLATFORM_CONFIG_ID, GAME_REGISTRY_ID)
        const data = tx.getData()

        expect(data.commands).toHaveLength(2)
        expect(data.commands[1].$kind).toBe('MoveCall')

        if (data.commands[1].$kind === 'MoveCall') {
            expect(data.commands[1].MoveCall.arguments).toHaveLength(13)
        }
    })
})
