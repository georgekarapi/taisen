#!/usr/bin/env node

/**
 * Deploy Move Contracts to Sui Devnet
 * 
 * Usage: pnpm deploy:contracts
 */

import { execSync } from "node:child_process";

const MOVE_HOME = "/tmp/move_home";
const SUI_CONFIG = "/tmp/sui_temp_config/client.yaml";
const PACKAGE_PATH = "./move/tournament_platform";

interface DeploymentResult {
    packageId: string;
    platformConfigId: string;
    gameRegistryId: string;
    adminCapId: string;
    upgradeCapId: string;
    digest: string;
}

function exec(cmd: string): string {
    return execSync(cmd, { encoding: "utf-8" }).trim();
}

function buildPackage(): void {
    console.log("\n🔨 Building Move package...");
    exec(`cd ${PACKAGE_PATH} && MOVE_HOME=${MOVE_HOME} sui move build 2>&1`);
    console.log("   Build successful!");
}

function publishPackage(): DeploymentResult {
    console.log("\n🚀 Publishing to devnet...");

    const result = exec(
        `cd ${PACKAGE_PATH} && MOVE_HOME=${MOVE_HOME} sui client --client.config ${SUI_CONFIG} publish --gas-budget 500000000 --json 2>&1`
    );

    // Parse JSON from output (skip any warning lines)
    const jsonStart = result.indexOf("{");
    const jsonStr = result.slice(jsonStart);
    const json = JSON.parse(jsonStr);

    if (json.effects?.status?.status !== "success") {
        throw new Error(`Publish failed: ${json.effects?.status?.error || "Unknown error"}`);
    }

    // Extract object IDs from objectChanges
    const changes = json.objectChanges || [];

    const packageChange = changes.find((c: any) => c.type === "published");
    const platformConfigChange = changes.find((c: any) =>
        c.type === "created" && c.objectType?.includes("PlatformConfig")
    );
    const gameRegistryChange = changes.find((c: any) =>
        c.type === "created" && c.objectType?.includes("GameRegistry")
    );
    const adminCapChange = changes.find((c: any) =>
        c.type === "created" && c.objectType?.includes("AdminCap")
    );
    const upgradeCapChange = changes.find((c: any) =>
        c.type === "created" && c.objectType?.includes("UpgradeCap")
    );

    return {
        packageId: packageChange?.packageId || "",
        platformConfigId: platformConfigChange?.objectId || "",
        gameRegistryId: gameRegistryChange?.objectId || "",
        adminCapId: adminCapChange?.objectId || "",
        upgradeCapId: upgradeCapChange?.objectId || "",
        digest: json.digest,
    };
}

function cleanBuildArtifacts(): void {
    console.log("🧹 Cleaning build artifacts...");
    try {
        execSync(`rm -f ${PACKAGE_PATH}/Published.toml`);
        // execSync(`rm -rf ${PACKAGE_PATH}/build`); // Optional: clear build folder too
    } catch (e) {
        // Ignore errors if file doesn't exist
    }
}

async function main() {
    const args = process.argv.slice(2);
    const useTestnet = args.includes("--testnet");
    const network = useTestnet ? "testnet" : "devnet";
    const rpcUrl = useTestnet ? "https://fullnode.testnet.sui.io:443" : "https://fullnode.devnet.sui.io:443";

    console.log("🎮 Taisen Contract Deployment Script");
    console.log("════════════════════════════════════");
    console.log(`Network: ${network}\n`);

    try {
        setupSuiConfig(network, rpcUrl);
        cleanBuildArtifacts();
        buildPackage();
        const result = publishPackage();
        printResults(result, network);

        // Post-deploy setup for Devnet ONLY
        if (network === "devnet") {
            console.log("\n🔧 Configuring for Devnet...");

            // Lower creation fee to 0.001 SUI
            console.log("   Creating fee update transaction...");
            try {
                exec(
                    `sui client --client.config ${SUI_CONFIG} call ` +
                    `--package ${result.packageId} ` +
                    `--module platform_config ` +
                    `--function update_creation_fee ` +
                    `--args ${result.platformConfigId} ${result.adminCapId} 1000000 ` + // 0.001 SUI
                    `--gas-budget 10000000`
                );
                console.log("   ✅ Creation fee lowered to 0.001 SUI");
            } catch (e: any) {
                console.warn("   ⚠️ Failed to update creation fee:", e.message.split('\n')[0]);
            }

            // Register Games
            console.log("   Registering games...");
            const GAMES = [
                { title: "Yu-gi-oh!", slug: "yu-gi-oh" },
                { title: "Magic: The Gathering", slug: "magic-the-gathering" },
                { title: "Shadowverse", slug: "shadowverse" },
                { title: "Riftbound", slug: "riftbound" },
                { title: "Pokemon", slug: "pokemon" },
            ];

            for (const game of GAMES) {
                try {
                    exec(
                        `sui client --client.config ${SUI_CONFIG} call ` +
                        `--package ${result.packageId} ` +
                        `--module game_registry ` +
                        `--function add_game ` +
                        `--args ${result.gameRegistryId} ${result.adminCapId} "${game.title}" "${game.slug}" ` +
                        `--gas-budget 10000000`
                    );
                    console.log(`   ✅ Registered ${game.title}`);
                } catch (e: any) {
                    console.warn(`   ⚠️ Failed to register ${game.title}:`, e.message.split('\n')[0]);
                }
            }
        }
    } catch (error: any) {
        console.error("\n❌ Deployment failed:", error.message);
        if (error.stdout) console.error("\nSTDOUT:\n", error.stdout);
        if (error.stderr) console.error("\nSTDERR:\n", error.stderr);
        process.exit(1);
    }
}

function setupSuiConfig(network: string, rpcUrl: string): void {
    console.log("📁 Setting up Sui config...");

    // Create temp directory
    execSync("mkdir -p /tmp/sui_temp_config /tmp/move_home");

    // Copy keystore
    execSync("cp ~/.sui/sui_config/sui.keystore /tmp/sui_temp_config/ 2>/dev/null || true");

    // Get active address from original config
    const originalConfig = exec("cat ~/.sui/sui_config/client.yaml");
    const addressMatch = originalConfig.match(/active_address:\s*"?(0x[a-f0-9]+)"?/);
    const activeAddress = addressMatch ? addressMatch[1] : "0x0";

    // Create config
    const config = `---
keystore:
  File: /tmp/sui_temp_config/sui.keystore
external_keys: ~
envs:
  - alias: ${network}
    rpc: "${rpcUrl}"
    ws: ~
    basic_auth: ~
active_env: ${network}
active_address: "${activeAddress}"
`;

    execSync(`cat > ${SUI_CONFIG} << 'EOF'
${config}
EOF`);

    console.log(`   Active address: ${activeAddress}`);
}

function printResults(result: DeploymentResult, network: string): void {
    console.log("\n" + "═".repeat(60));
    console.log("✅ DEPLOYMENT SUCCESSFUL");
    console.log("═".repeat(60));
    console.log();
    console.log("📦 Contract Addresses:");
    console.log("─".repeat(60));
    console.log(`Package ID:        ${result.packageId}`);
    console.log(`PlatformConfig ID: ${result.platformConfigId}`);
    console.log(`GameRegistry ID:   ${result.gameRegistryId}`);
    console.log(`AdminCap ID:       ${result.adminCapId}`);
    console.log(`UpgradeCap ID:     ${result.upgradeCapId}`);
    console.log("─".repeat(60));
    console.log(`Transaction:       ${result.digest}`);
    console.log();
    console.log("🌐 Explorer Links:");
    console.log(`   Package:  https://suiscan.xyz/${network}/object/${result.packageId}`);
    console.log(`   Tx:       https://suiscan.xyz/${network}/tx/${result.digest}`);
    console.log();
    console.log("📋 Environment Variables (add to .env):");
    console.log("─".repeat(60));
    console.log(`NUXT_PUBLIC_SUI_NETWORK=${network}`);
    console.log(`NUXT_PUBLIC_PACKAGE_ID=${result.packageId}`);
    console.log(`NUXT_PUBLIC_PLATFORM_CONFIG_ID=${result.platformConfigId}`);
    console.log(`NUXT_PUBLIC_GAME_REGISTRY_ID=${result.gameRegistryId}`);
    console.log(`NUXT_PUBLIC_ADMIN_CAP_ID=${result.adminCapId}`);
    console.log("═".repeat(60));
}

main();
