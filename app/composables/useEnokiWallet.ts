import { ref, computed, onMounted } from 'vue'
import { getWallets, type Wallet, type WalletAccount } from '@wallet-standard/core'
import { isEnokiWallet, type EnokiWallet } from '@mysten/enoki'

interface EnokiWalletState {
    wallet: EnokiWallet | null
    account: WalletAccount | null
    isConnecting: boolean
    error: string | null
}

const state = ref<EnokiWalletState>({
    wallet: null,
    account: null,
    isConnecting: false,
    error: null,
})

let walletsApi: ReturnType<typeof getWallets> | null = null

function initWallets() {
    if (import.meta.server) return null

    if (!walletsApi) {
        walletsApi = getWallets()

        // Listen for new wallet registrations
        walletsApi.on('register', () => {
            checkForConnectedWallet()
        })

        walletsApi.on('unregister', () => {
            checkForConnectedWallet()
        })
    }

    return walletsApi
}

function checkForConnectedWallet() {
    if (!walletsApi) return

    const wallets = walletsApi.get()
    const enokiWallets = wallets.filter(isEnokiWallet) as EnokiWallet[]

    // Check if any Enoki wallet has connected accounts
    for (const wallet of enokiWallets) {
        if (wallet.accounts && wallet.accounts.length > 0) {
            state.value.wallet = wallet
            state.value.account = wallet.accounts[0] as WalletAccount
            return
        }
    }

    // No connected wallet
    state.value.account = null
}

export function useEnokiWallet() {
    const isConnected = computed(() => !!state.value.account)
    const address = computed(() => state.value.account?.address ?? null)
    const isConnecting = computed(() => state.value.isConnecting)
    const error = computed(() => state.value.error)

    const truncatedAddress = computed(() => {
        if (!address.value) return null
        return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
    })

    async function connect() {
        if (import.meta.server) return

        const api = initWallets()
        if (!api) {
            state.value.error = 'Wallet API not available'
            return
        }

        state.value.isConnecting = true
        state.value.error = null

        try {
            const wallets = api.get()
            const enokiWallets = wallets.filter(isEnokiWallet) as EnokiWallet[]
            const googleWallet = enokiWallets.find((w) => w.provider === 'google')

            console.log('Attempting to connect Google wallet. Available Enoki wallets:', enokiWallets.map(w => w.provider))

            if (!googleWallet) {
                const config = useRuntimeConfig()
                const clientId = config.public.googleClientId as string
                const maskedClientId = clientId ? `${clientId.slice(0, 5)}...${clientId.slice(-5)}` : 'undefined'
                state.value.error = 'Google wallet not available. Please check Enoki configuration.'
                console.error('Google wallet not found among available wallets:', wallets.map(w => w.name))
                console.log('Current Google Client ID:', maskedClientId)
                return
            }

            // Access the connect feature using wallet-standard interface
            const connectFeature = googleWallet.features['standard:connect']
            if (connectFeature && typeof connectFeature === 'object' && 'connect' in connectFeature) {
                console.log('Calling connect feature...')
                const result = await (connectFeature as { connect: () => Promise<{ accounts: WalletAccount[] }> }).connect()
                console.log('Connect result:', result)
                if (result.accounts && result.accounts.length > 0) {
                    state.value.wallet = googleWallet
                    state.value.account = result.accounts[0] as WalletAccount
                }
            }
            else {
                state.value.error = 'Wallet does not support connect feature'
                console.error('standard:connect feature missing on wallet:', googleWallet)
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect'
            state.value.error = errorMessage
            console.error('Enoki connect error full details:', err)

            if (errorMessage.includes('Popup closed')) {
                state.value.error = 'Login window was closed or blocked. Please try again.'
            }
        }
        finally {
            state.value.isConnecting = false
        }
    }

    async function disconnect() {
        if (!state.value.wallet) return

        try {
            const disconnectFeature = state.value.wallet.features['standard:disconnect']
            if (disconnectFeature && typeof disconnectFeature === 'object' && 'disconnect' in disconnectFeature) {
                await (disconnectFeature as { disconnect: () => Promise<void> }).disconnect()
            }
        }
        catch (err) {
            console.error('Enoki disconnect error:', err)
        }
        finally {
            state.value.wallet = null
            state.value.account = null
        }
    }

    onMounted(() => {
        initWallets()
        // Check for existing connection after a short delay to allow plugin to register
        setTimeout(checkForConnectedWallet, 300)
    })

    return {
        isConnected,
        address,
        truncatedAddress,
        isConnecting,
        error,
        connect,
        disconnect,
    }
}
