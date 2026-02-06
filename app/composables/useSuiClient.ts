import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc'

let client: SuiJsonRpcClient | null = null

/**
 * Get a configured Sui client for the current network
 */
export function useSuiClient() {
    const config = useRuntimeConfig()

    const network = (config.public.suiNetwork as 'devnet' | 'testnet' | 'mainnet') || 'devnet'
    const packageId = config.public.packageId as string
    const platformConfigId = config.public.platformConfigId as string
    const gameRegistryId = config.public.gameRegistryId as string

    // Create singleton client
    if (!client) {
        client = new SuiJsonRpcClient({
            url: getJsonRpcFullnodeUrl(network),
            network: network,
        })
    }

    return {
        client,
        network,
        packageId,
        platformConfigId,
        gameRegistryId,
    }
}
