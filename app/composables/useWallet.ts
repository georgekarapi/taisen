import { ref, computed, onMounted, markRaw, toRaw } from 'vue'
import { getWallets, type Wallet, type WalletAccount } from '@wallet-standard/core'
import { isEnokiWallet, type EnokiWallet } from '@mysten/enoki'

interface WalletState {
    wallet: Wallet | null
    account: WalletAccount | null
    isConnecting: boolean
    error: string | null
    isEnoki: boolean
}

const state = ref<WalletState>({
    wallet: null,
    account: null,
    isConnecting: false,
    error: null,
    isEnoki: false
})

let walletsApi: ReturnType<typeof getWallets> | null = null

function initWallets() {
    if (import.meta.server) return null

    if (!walletsApi) {
        walletsApi = getWallets()

        // Listen for updates
        walletsApi.on('register', () => {
            checkForConnectedWallet()
        })

        walletsApi.on('unregister', () => {
            checkForConnectedWallet()
        })
    }

    return walletsApi
}

export const DISCONNECTED_KEY = 'taisen_wallet_disconnected'
const unsubs = new Map<string, () => void>()

function setupWalletListeners(wallet: Wallet) {
    // Cleanup existing listener for this wallet
    if (unsubs.has(wallet.name)) {
        unsubs.get(wallet.name)!()
        unsubs.delete(wallet.name)
    }

    if ('standard:events' in wallet.features) {
        try {
            const feature = wallet.features['standard:events'] as any
            const unsub = feature.on('change', (properties: any) => {
                if (properties.accounts && state.value.wallet?.name === wallet.name) {
                    if (properties.accounts.length > 0) {
                        state.value.account = markRaw(properties.accounts[0]) as WalletAccount
                    } else {
                        state.value.wallet = null
                        state.value.account = null
                        state.value.isEnoki = false
                    }
                }
            })
            unsubs.set(wallet.name, unsub)
        } catch (err) {
            console.error(`Failed to setup listeners for ${wallet.name}: `, err)
        }
    }
}

// Helper to check if a wallet supports Sui
function isSuiWallet(wallet: Wallet): boolean {
    const chains = wallet.chains as any as string[]
    return chains?.some((chain: string) => chain.startsWith('sui:')) ?? false
}

// Helper to get only Sui accounts from a wallet
function getSuiAccounts(accounts: readonly WalletAccount[]): WalletAccount[] {
    return accounts.filter(account =>
        account.chains.some(chain => chain.startsWith('sui:'))
    )
}

// Update check function to filter wallets
function checkForConnectedWallet() {
    if (import.meta.server) return
    if (!walletsApi) return

    // Skip if user intentionally disconnected
    if (localStorage.getItem(DISCONNECTED_KEY) === 'true') {
        state.value.wallet = null
        state.value.account = null
        state.value.isEnoki = false
        return
    }

    const wallets = walletsApi.get()

    // Try to find a wallet with already connected accounts
    for (const wallet of wallets) {
        // Enforce strict chain check
        if (!isSuiWallet(wallet)) continue

        const suiAccounts = getSuiAccounts(wallet.accounts)
        if (suiAccounts.length > 0) {
            state.value.wallet = markRaw(wallet) as Wallet
            state.value.account = markRaw(suiAccounts[0]!) as WalletAccount
            state.value.isEnoki = isEnokiWallet(wallet)
            setupWalletListeners(wallet)
            return
        }
    }

    // No connected wallet found
    state.value.wallet = null
    state.value.account = null
    state.value.isEnoki = false
}

export function useWallet() {
    const isConnected = computed(() => !!state.value.account)
    const address = computed(() => state.value.account?.address ?? null)
    const activeWallet = computed(() => state.value.wallet)
    const accounts = computed(() => state.value.wallet?.accounts ?? [])
    const isConnecting = computed(() => state.value.isConnecting)
    const error = computed(() => state.value.error)
    const isEnoki = computed(() => state.value.isEnoki)

    const truncatedAddress = computed(() => {
        if (!address.value) return null
        return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
    })

    const getAvailableWallets = () => {
        const api = initWallets()
        if (!api) return []

        const wallets = api.get()
        const uniqueWallets: Wallet[] = []
        const seen = new Set<string>()

        for (const wallet of wallets) {
            // First check for strict Sui support
            if (!isSuiWallet(wallet)) continue

            if (!seen.has(wallet.name)) {
                uniqueWallets.push(wallet)
                seen.add(wallet.name)
            }
        }

        return uniqueWallets
    }

    async function connect(walletName: string) {
        if (import.meta.server) return

        const api = initWallets()
        if (!api) {
            state.value.error = 'Wallet API not available'
            return
        }

        const wallet = api.get().find(w => w.name === walletName)
        if (!wallet) {
            state.value.error = `Wallet ${walletName} not found`
            return
        }

        state.value.isConnecting = true
        state.value.error = null
        localStorage.removeItem(DISCONNECTED_KEY)

        try {
            // Standard wallet-standard connection
            if ('standard:connect' in wallet.features) {
                const feature = wallet.features['standard:connect'] as any

                // Explicitly request Sui chains to force Phantom/others to switch or provide correct accounts
                const result = await feature.connect({ chains: ['sui:mainnet', 'sui:testnet', 'sui:devnet'] })

                const suiAccounts = getSuiAccounts(result.accounts as WalletAccount[])

                if (suiAccounts.length > 0) {
                    state.value.wallet = markRaw(wallet) as Wallet // Keep original wallet type
                    state.value.account = markRaw(suiAccounts[0]!) as WalletAccount
                    state.value.isEnoki = isEnokiWallet(wallet)
                    setupWalletListeners(wallet)
                } else {
                    if (result.accounts && result.accounts.length > 0) {
                        state.value.error = 'Connected wallet is not set to Sui. Please switch to a Sui network in your wallet settings.'
                    } else {
                        state.value.error = 'No accounts found. Please unlock your wallet and try again.'
                    }
                }
            } else {
                console.error('[useWallet] Wallet does not support standard:connect feature')
                state.value.error = 'Wallet does not support connection'
            }
        } catch (err: any) {
            console.error('Connection failed:', err)
            state.value.error = err.message || 'Failed to connect wallet'
        } finally {
            state.value.isConnecting = false
        }
    }

    function selectAccount(account: WalletAccount) {
        state.value.account = markRaw(account) as WalletAccount
    }

    async function disconnect() {
        const wallet = toRaw(state.value.wallet)
        if (wallet && 'standard:disconnect' in wallet.features) {
            try {
                const feature = wallet.features['standard:disconnect'] as any
                await feature.disconnect()
            } catch (err) {
                console.error('Disconnect failed:', err)
            }
        }

        // Cleanup listener
        if (state.value.wallet && unsubs.has(state.value.wallet.name)) {
            unsubs.get(state.value.wallet.name)!()
            unsubs.delete(state.value.wallet.name)
        }

        state.value.wallet = null
        state.value.account = null
        state.value.isEnoki = false
        localStorage.setItem(DISCONNECTED_KEY, 'true')
    }

    onMounted(() => {
        initWallets()
        setTimeout(checkForConnectedWallet, 300)
    })

    return {
        isConnected,
        address,
        truncatedAddress,
        activeWallet,
        accounts,
        isConnecting,
        error,
        isEnoki,
        connect,
        disconnect,
        selectAccount,
        getAvailableWallets,
        refresh: checkForConnectedWallet,
    }
}
