import { ref, computed, onMounted, markRaw, toRaw } from 'vue'
import { getWallets, type Wallet, type WalletAccount } from '@wallet-standard/core'
import { isEnokiWallet } from '@mysten/enoki'

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

export const DISCONNECTED_KEY = 'taisen_wallet_disconnected'

let walletsApi: ReturnType<typeof getWallets> | null = null
const unsubs = new Map<string, () => void>()

// Consolidated state reset
function resetWalletState() {
    state.value.wallet = null
    state.value.account = null
    state.value.isEnoki = false
}

function initWallets() {
    if (import.meta.server) return null

    if (!walletsApi) {
        walletsApi = getWallets()
        walletsApi.on('register', checkForConnectedWallet)
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

function getSuiAccounts(accounts: readonly WalletAccount[], trustAllIfEmpty = false): WalletAccount[] {
    const filtered = accounts.filter(acc => acc.chains?.some(c => c.startsWith('sui:')))

    // Fallback for wallets (like Phantom) that don't populate account chains
    return filtered.length > 0 ? filtered : (trustAllIfEmpty ? [...accounts] : [])
}

function checkForConnectedWallet() {
    if (import.meta.server || !walletsApi) return

    if (localStorage.getItem(DISCONNECTED_KEY) === 'true') {
        resetWalletState()
        return
    }

    for (const wallet of walletsApi.get()) {
        if (!isSuiWallet(wallet)) continue

        const suiAccounts = getSuiAccounts(wallet.accounts, true)
        if (suiAccounts.length > 0) {
            state.value.wallet = markRaw(wallet)
            state.value.account = markRaw(suiAccounts[0]!)
            state.value.isEnoki = isEnokiWallet(wallet)
            setupWalletListeners(wallet)
            return
        }
    }

    resetWalletState()
}

export function useWallet() {
    const isConnected = computed(() => !!state.value.account)
    const address = computed(() => state.value.account?.address ?? null)
    const activeWallet = computed(() => state.value.wallet)
    const account = computed(() => state.value.account)
    const accounts = computed(() => state.value.wallet?.accounts ?? [])
    const isConnecting = computed(() => state.value.isConnecting)
    const error = computed(() => state.value.error)
    const isEnoki = computed(() => state.value.isEnoki)

    const truncatedAddress = computed(() =>
        address.value ? `${address.value.slice(0, 6)}...${address.value.slice(-4)}` : null
    )

    function getAvailableWallets(): Wallet[] {
        const api = initWallets()
        if (!api) return []

        const seen = new Set<string>()
        return api.get().filter(wallet => {
            if (!isSuiWallet(wallet) || seen.has(wallet.name)) return false
            seen.add(wallet.name)
            return true
        })
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

        const connectFeature = wallet.features['standard:connect']
        if (!connectFeature) {
            state.value.error = 'Wallet does not support connection'
            return
        }

        state.value.isConnecting = true
        state.value.error = null
        localStorage.removeItem(DISCONNECTED_KEY)

        try {
            const result = await (connectFeature as any).connect({
                chains: ['sui:mainnet', 'sui:testnet', 'sui:devnet']
            })

            const suiAccounts = getSuiAccounts(result.accounts, isSuiWallet(wallet))
            if (suiAccounts.length > 0) {
                state.value.wallet = markRaw(wallet)
                state.value.account = markRaw(suiAccounts[0]!)
                state.value.isEnoki = isEnokiWallet(wallet)
                setupWalletListeners(wallet)
            }
        } catch (err: any) {
            console.error('Connection failed:', err)
            state.value.error = err.message || 'Failed to connect wallet'
        } finally {
            state.value.isConnecting = false
        }
    }

    function selectAccount(account: WalletAccount) {
        state.value.account = markRaw(account)
    }

    async function disconnect() {
        const wallet = toRaw(state.value.wallet)

        if (wallet) {
            const disconnectFeature = wallet.features['standard:disconnect']
            if (disconnectFeature) {
                try {
                    await (disconnectFeature as any).disconnect()
                } catch (err) {
                    console.error('Disconnect failed:', err)
                }
            }

            unsubs.get(wallet.name)?.()
            unsubs.delete(wallet.name)
        }

        resetWalletState()
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
        account,
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
