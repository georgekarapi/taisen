import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc'
import { registerEnokiWallets, type EnokiNetwork } from '@mysten/enoki'

export default defineNuxtPlugin({
    name: 'enoki',
    enforce: 'pre',
    setup(nuxtApp) {
        // Only run on client
        if (import.meta.server) return

        const config = useRuntimeConfig()
        const network: EnokiNetwork = 'testnet'

        // Create JSON-RPC client for testnet
        const client = new SuiJsonRpcClient({
            url: `https://fullnode.${network}.sui.io:443`,
            network: network as any,
        })

        // Register Enoki wallets with wallet-standard
        const { unregister } = registerEnokiWallets({
            client,
            network,
            apiKey: config.public.enokiApiKey as string,
            providers: {
                google: {
                    clientId: config.public.googleClientId as string,
                    // Explicitly set the redirect URL to match the expected OAuth callback
                    redirectUrl: window.location.origin,
                },
            },
        })

        if (process.dev) {
            console.log('Enoki initialized with:', {
                network,
                hasApiKey: !!config.public.enokiApiKey,
                hasClientId: !!config.public.googleClientId,
                redirectUrl: window.location.origin
            })
        }

        return {
            provide: {
                enokiClient: client,
                enokiNetwork: network,
                enokiUnregister: unregister,
            },
        }
    },
})
