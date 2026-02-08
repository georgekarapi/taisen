import { ref, computed, onMounted, markRaw, toRaw, watch } from 'vue'
import { getWallets, type Wallet, type WalletAccount } from '@wallet-standard/core'

interface WalletState {
    wallet: Wallet | null
    account: WalletAccount | null
    isConnecting: boolean
    error: string | null
    isAuthReady: boolean
}

const state = ref<WalletState>({
    wallet: null,
    account: null,
    isConnecting: false,
    error: null,
    isAuthReady: false
})

export const DISCONNECTED_KEY = 'taisen_wallet_disconnected'
export const LAST_WALLET_KEY = 'taisen_last_wallet'

const unsubs = new Map<string, () => void>()
let walletsApi: ReturnType<typeof getWallets> | null = null
let isInitialized = false

// Consolidated state reset
function resetWalletState() {
    state.value.wallet = null
    state.value.account = null
}

// Dedicated handler for wallet registration to debug async loading
function handleWalletRegister(wallet: Wallet) {
    checkForConnectedWallet()
}

function initWallets() {
    if (import.meta.server) return null

    if (!walletsApi) {
        walletsApi = getWallets()
        walletsApi.on('register', handleWalletRegister)
        walletsApi.on('unregister', checkForConnectedWallet)
    }

    return walletsApi
}

function setupWalletListeners(wallet: Wallet) {
    // Cleanup existing listener
    unsubs.get(wallet.name)?.()
    unsubs.delete(wallet.name)

    const eventsFeature = wallet.features['standard:events']
    if (!eventsFeature) return

    try {
        const unsub = (eventsFeature as any).on('change', (properties: any) => {
            if (!properties.accounts || state.value.wallet?.name !== wallet.name) return

            if (properties.accounts.length > 0) {
                state.value.account = markRaw(properties.accounts[0])
            } else {
                resetWalletState()
            }
        })
        unsubs.set(wallet.name, unsub)
    } catch (err) {
        console.error(`Failed to setup listeners for ${wallet.name}:`, err)
    }
}

function isSuiWallet(wallet: Wallet): boolean {
    return (wallet.chains as string[])?.some(chain => chain.startsWith('sui:')) ?? false
}

function getSuiAccounts(accounts: readonly WalletAccount[] | undefined | null, trustAllIfEmpty = false): WalletAccount[] {
    if (!accounts || !Array.isArray(accounts)) return []

    const filtered = accounts.filter(acc => acc.chains?.some((c: string) => c.startsWith('sui:')))

    // Fallback for wallets (like Phantom) that don't populate account chains
    return filtered.length > 0 ? filtered : (trustAllIfEmpty ? [...accounts] : [])
}

async function connect(walletName: string) {
    if (import.meta.server) return

    const api = initWallets()
    if (!api) {
        state.value.error = 'Wallet API not available'
        return
    }

    const wallet = api.get().find((w: Wallet) => w.name === walletName)
    if (!wallet) {
        state.value.error = `Wallet ${walletName} not found`
        return
    }

    const connectFeature = wallet.features['standard:connect']
    if (!connectFeature) {
        state.value.error = 'Wallet does not support connection'
        return
    }

    state.value.isConnecting = true
    state.value.error = null

    try {
        const result = await (connectFeature as any).connect({
            chains: ['sui:mainnet', 'sui:testnet', 'sui:devnet']
        })

        const suiAccounts = getSuiAccounts(result.accounts, isSuiWallet(wallet))
        if (suiAccounts.length > 0) {
            state.value.wallet = markRaw(wallet)
            state.value.account = markRaw(suiAccounts[0]!)
            setupWalletListeners(wallet)
            localStorage.setItem(LAST_WALLET_KEY, wallet.name)
            localStorage.removeItem(DISCONNECTED_KEY)
        }
    } catch (err: any) {
        console.error('Connection failed:', err)
        state.value.error = err.message || 'Failed to connect wallet'
    } finally {
        state.value.isConnecting = false
        state.value.isAuthReady = true
    }
}

function checkForConnectedWallet() {
    if (import.meta.server || !walletsApi) return

    if (state.value.account) {
        state.value.isAuthReady = true
        return
    }

    if (localStorage.getItem(DISCONNECTED_KEY) === 'true') {
        resetWalletState()
        state.value.isAuthReady = true
        return
    }

    const lastWalletName = localStorage.getItem(LAST_WALLET_KEY)
    const wallets = walletsApi.get()

    // Prioritize last used wallet
    if (lastWalletName) {
        const lastWallet = wallets.find((w: Wallet) => w.name === lastWalletName)
        if (lastWallet && isSuiWallet(lastWallet)) {
            const suiAccounts = getSuiAccounts(lastWallet.accounts, true)
            if (suiAccounts.length > 0) {
                state.value.wallet = markRaw(lastWallet)
                state.value.account = markRaw(suiAccounts[0]!)
                setupWalletListeners(lastWallet)
                state.value.isAuthReady = true
                return
            } else {
                connect(lastWalletName)
                return
            }
        } else {
            // Last wallet not found yet. Waiting for register event.
        }
        // If we have a last wallet set, do NOT auto-connect to others
        // This prevents Phantom from taking over while we wait for Slush
        return
    }

    // Only auto-connect to others if no last wallet is set
    for (const wallet of wallets) {
        if (!isSuiWallet(wallet) || wallet.name === lastWalletName) continue

        const suiAccounts = getSuiAccounts(wallet.accounts, true)
        if (suiAccounts.length > 0) {
            state.value.wallet = markRaw(wallet)
            state.value.account = markRaw(suiAccounts[0]!)
            setupWalletListeners(wallet)
            state.value.isAuthReady = true
            return
        }
    }

    resetWalletState()
    state.value.isAuthReady = true
}

export function useWallet() {
    if (import.meta.server) {
        return {
            isConnected: computed(() => false),
            address: computed(() => null),
            truncatedAddress: computed(() => null),
            activeWallet: computed(() => null),
            account: computed(() => null),
            accounts: computed(() => []),
            isConnecting: computed(() => false),
            error: computed(() => null),
            connect: async () => { },
            disconnect: async () => { },
            selectAccount: () => { },
            getAvailableWallets: () => [],
            refresh: () => { },
            isAuthReady: computed(() => false),
        }
    }

    const isConnected = computed(() => !!state.value.account)
    const address = computed(() => state.value.account?.address ?? null)
    const activeWallet = computed(() => state.value.wallet)
    const account = computed(() => state.value.account)
    const accounts = computed(() => state.value.wallet?.accounts ?? [])
    const isConnecting = computed(() => state.value.isConnecting)
    const error = computed(() => state.value.error)
    const isAuthReady = computed(() => state.value.isAuthReady)

    const truncatedAddress = computed(() =>
        address.value ? `${address.value.slice(0, 6)}...${address.value.slice(-4)}` : null
    )

    function getAvailableWallets(): Wallet[] {
        const api = initWallets()
        if (!api) return []

        const seen = new Set<string>()
        return api.get().filter((wallet: Wallet) => {
            if (!isSuiWallet(wallet) || seen.has(wallet.name)) return false
            seen.add(wallet.name)
            return true
        })
    }


    function selectAccount(account: WalletAccount) {
        state.value.account = markRaw(account)
    }

    async function disconnect() {
        localStorage.setItem(DISCONNECTED_KEY, 'true')
        resetWalletState()

        const wallet = toRaw(state.value.wallet)

        if (wallet) {
            const disconnectFeature = wallet.features['standard:disconnect']
            if (disconnectFeature) {
                try {
                    await (disconnectFeature as any).disconnect()
                } catch (err) {
                    console.error('[useWallet] Disconnect feature failed:', err)
                }
            } else {
                // Feature not supported
            }

            unsubs.get(wallet.name)?.()
            unsubs.delete(wallet.name)
        }

        localStorage.removeItem(LAST_WALLET_KEY)
    }

    onMounted(() => {
        initWallets()
        if (!isInitialized) {
            isInitialized = true
            setTimeout(checkForConnectedWallet, 300)

            // Safety timeout: ease-in the UI if wallet check takes too long
            setTimeout(() => {
                if (!state.value.isAuthReady) {
                    state.value.isAuthReady = true
                }
            }, 2500)
        }
    })

    return {
        isConnected,
        address,
        truncatedAddress,
        activeWallet,
        account,
        accounts,
        isConnecting,
        error,
        connect,
        disconnect,
        selectAccount,
        getAvailableWallets,
        refresh: checkForConnectedWallet,
        isAuthReady,
    }
}
