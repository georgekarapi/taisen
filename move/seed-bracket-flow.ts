import { SuiJsonRpcClient as SuiClient, getJsonRpcFullnodeUrl as getFullnodeUrl } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import * as fs from 'node:fs';

// Configuration from seed-tournaments.ts
const CONFIG = {
    packageId: "0x33ff1b5217d0fce422b64bb689fb439791b1ff26f9b3bb760f10634db24fcfba",
    platformConfigId: "0x8c721df3cfce969ad44ce836bd58743ae4496b3bd48336552882948018713ee8",
    gameRegistryId: "0x1a91a762b2d3a6f02a4e4b369eb54994383a3b1e1a3851e7ad975fe9cd530a1c",
    adminCapId: "0x23be05c104022c68543495b60a5464bece20d09d6ea73aebba8dc287e15bbf57",
    creationFee: 1_000_000n, // 0.001 SUI
};

const TOURNAMENT_NAME = "Bracket Flow Test";
const PARTICIPANT_COUNT = 8;
const ENTRY_FEE = 0n; // Free for easier testing
const FUND_AMOUNT = 50_000_000n; // 0.05 SUI per participant (covers gas)

async function main() {
    // 1. Key Setup
    const privateKey = process.env.SUI_PRIVATE_KEY;
    if (!privateKey) {
        console.error("Error: SUI_PRIVATE_KEY is required");
        process.exit(1);
    }
    const gmKeypair = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(privateKey).secretKey);
    const gmAddress = gmKeypair.getPublicKey().toSuiAddress();

    // 2. Client Setup
    const client = new SuiClient({ url: getFullnodeUrl("devnet") });
    console.log(`\n🎮 Bracket Flow Seeder`);
    console.log(`GM: ${gmAddress}`);

    // 2a. Register Game (if needed)
    console.log(`\n0. Registering Game: Yu-Gi-Oh!`);
    const regTx = new Transaction();
    regTx.moveCall({
        target: `${CONFIG.packageId}::game_registry::add_game`,
        arguments: [
            regTx.object(CONFIG.gameRegistryId),
            regTx.object(CONFIG.adminCapId),
            regTx.pure.string("Yu-Gi-Oh!"),
            regTx.pure.string("yu-gi-oh")
        ]
    });

    try {
        await client.signAndExecuteTransaction({
            signer: gmKeypair,
            transaction: regTx,
            options: { showEffects: true }
        });
        console.log(`   ✅ Game Registered`);
    } catch (e: any) {
        if (e.message?.includes("1004")) { // EGameAlreadyExists
            console.log(`   ℹ️ Game "yu-gi-oh" already registered`);
        } else {
            console.warn(`   ⚠️ Warning registering game: ${e.message}`);
        }
    }

    // 2b. Update Creation Fee to 0.001 SUI (since default is 1 SUI)
    console.log(`\n0b. Updating Creation Fee to 0.001 SUI`);
    const feeTx = new Transaction();
    feeTx.moveCall({
        target: `${CONFIG.packageId}::platform_config::update_creation_fee`,
        arguments: [
            feeTx.object(CONFIG.platformConfigId),
            feeTx.object(CONFIG.adminCapId),
            feeTx.pure.u64(1_000_000n)
        ]
    });

    try {
        await client.signAndExecuteTransaction({
            signer: gmKeypair,
            transaction: feeTx,
            options: { showEffects: true }
        });
        console.log(`   ✅ Creation Fee Updated`);
    } catch (e: any) {
        console.warn(`   ⚠️ Warning updating fee: ${e.message}`);
    }

    // 3. Create Tournament
    console.log(`\n1. Creating Tournament: ${TOURNAMENT_NAME}`);
    const now = Date.now();
    const createTx = new Transaction();
    const [paymentCoin] = createTx.splitCoins(createTx.gas, [CONFIG.creationFee]);

    createTx.moveCall({
        target: `${CONFIG.packageId}::tournament::create_tournament`,
        arguments: [
            createTx.object(CONFIG.platformConfigId),
            createTx.object(CONFIG.gameRegistryId),
            createTx.pure.string(TOURNAMENT_NAME),
            createTx.pure.string("Test Lab"),
            createTx.pure.u64(now + 3600000), // 1 hour from now
            createTx.pure.string("yu-gi-oh"), // Use existing slug
            createTx.pure.string("Testing bracket flow"),
            createTx.pure.u64(ENTRY_FEE),
            createTx.pure.u64(0), // 0% GM fee
            paymentCoin,
        ],
    });

    try {
        const createRes = await client.signAndExecuteTransaction({
            signer: gmKeypair,
            transaction: createTx,
            options: { showObjectChanges: true, showEffects: true }
        });

        if (createRes.effects?.status.status !== "success") {
            console.error("Failed to create tournament:", createRes.effects?.status.error);
            process.exit(1);
        }

        const tournamentId = createRes.objectChanges?.find(
            (c) => c.type === "created" && c.objectType?.includes("Tournament")
        ) && 'objectId' in (createRes.objectChanges?.find(
            (c) => c.type === "created" && c.objectType?.includes("Tournament")
        ) || {}) ? (createRes.objectChanges?.find(
            (c) => c.type === "created" && c.objectType?.includes("Tournament")
        ) as any).objectId : null;

        if (!tournamentId) {
            console.error("Could not find tournament ID");
            process.exit(1);
        }
        console.log(`   ✅ Tournament Created: ${tournamentId}`);

        // 4. Generate & Fund Participants
        console.log(`\n2. Generating & Funding ${PARTICIPANT_COUNT} Participants`);
        const participantKeypairs: Ed25519Keypair[] = [];
        const fundTx = new Transaction();

        // Split coins for funding
        // splitCoins takes (coin, amounts[])
        const fundAmounts = Array(PARTICIPANT_COUNT).fill(FUND_AMOUNT);
        const fundCoins = fundTx.splitCoins(fundTx.gas, fundAmounts);

        for (let i = 0; i < PARTICIPANT_COUNT; i++) {
            const kp = new Ed25519Keypair();
            participantKeypairs.push(kp);
            const addr = kp.getPublicKey().toSuiAddress();

            // Transfer fund coin to new address
            fundTx.transferObjects([fundCoins[i]], addr);
        }

        const fundRes = await client.signAndExecuteTransaction({
            signer: gmKeypair,
            transaction: fundTx,
            options: { showEffects: true }
        });

        if (fundRes.effects?.status.status !== "success") {
            console.error("Funding failed:", fundRes.effects?.status.error);
            process.exit(1);
        }
        console.log(`   ✅ Funded ${PARTICIPANT_COUNT} wallets`);

        // 5. Register Participants
        console.log(`\n3. Registering Participants...`);
        for (let i = 0; i < participantKeypairs.length; i++) {
            const kp = participantKeypairs[i];
            const addr = kp.getPublicKey().toSuiAddress();
            const tx = new Transaction();

            // Entry fee is 0
            const [payCoin] = tx.splitCoins(tx.gas, [0]);

            tx.moveCall({
                target: `${CONFIG.packageId}::tournament::register`,
                arguments: [
                    tx.object(tournamentId),
                    payCoin
                ]
            });

            const res = await client.signAndExecuteTransaction({
                signer: kp,
                transaction: tx,
                options: { showEffects: true }
            });

            if (res.effects?.status.status === "success") {
                console.log(`   [${i + 1}/${PARTICIPANT_COUNT}] Registered ${addr.slice(0, 6)}...`);
            } else {
                console.error(`   [${i + 1}/${PARTICIPANT_COUNT}] Failed: ${res.effects?.status.error}`);
            }

            // Tiny delay to avoid congestion
            await new Promise(r => setTimeout(r, 200));
        }

        // 6. Start Tournament
        console.log(`\n4. Starting Tournament`);
        const startTx = new Transaction();
        startTx.moveCall({
            target: `${CONFIG.packageId}::tournament::start_tournament`,
            arguments: [
                startTx.object(tournamentId)
            ]
        });

        const startRes = await client.signAndExecuteTransaction({
            signer: gmKeypair,
            transaction: startTx,
            options: { showEffects: true }
        });

        if (startRes.effects?.status.status === "success") {
            console.log(`   ✅ Tournament Started!`);
        } else {
            console.error(`   ❌ Failed to start: ${startRes.effects?.status.error}`);
        }

        console.log(`\n✨ Seeding Complete!`);
        console.log(`Tournament ID: ${tournamentId}`);

        // Save to file for easy access
        fs.writeFileSync(
            "./move/bracket-test-tournament.json",
            JSON.stringify({ tournamentId, createdAt: new Date().toISOString() }, null, 2)
        );
        console.log(`Saved ID to ./move/bracket-test-tournament.json`);

    } catch (error) {
        console.error("Critical error:", error);
    }
}

main().catch(console.error);
