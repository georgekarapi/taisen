/**
 * Tournament Seeding Script for Devnet
 *
 * Creates tournaments with participants registered.
 * Requires AdminCap owner's private key to register games & lower creation fee.
 *
 * Usage:
 *   export SUI_PRIVATE_KEY='suiprivkey1...'
 *   npx tsx move/seed-tournaments.ts
 *
 * The script will:
 * 1. Register all games in the GameRegistry
 * 2. Lower the creation fee to 0.001 SUI (devnet convenience)
 * 3. Create 8 tournaments (mix of online & in-person)
 * 4. Generate participant wallets, fund them, register them
 * 5. Start tournaments that have enough participants
 */

import { Transaction } from "@mysten/sui/transactions";
import { SuiJsonRpcClient as SuiClient, getJsonRpcFullnodeUrl as getFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import * as fs from "node:fs";

// ── Configuration (update after deployment) ─────────────────────────
// ── Configuration (update after deployment) ─────────────────────────
const CONFIG = {
    packageId: process.env.NUXT_PUBLIC_PACKAGE_ID || "",
    platformConfigId: process.env.NUXT_PUBLIC_PLATFORM_CONFIG_ID || "",
    gameRegistryId: process.env.NUXT_PUBLIC_GAME_REGISTRY_ID || "",
    adminCapId: process.env.NUXT_PUBLIC_ADMIN_CAP_ID || "",
    creationFee: 1_000_000n, // 0.001 SUI after we lower it
    fundPerParticipant: 50_000_000n, // 0.05 SUI per participant for gas + entry
};

// ── Games (must match useGames.ts) ──────────────────────────────────
const GAMES = [
    { title: "Yu-gi-oh!", slug: "yu-gi-oh" },
    { title: "Magic: The Gathering", slug: "magic-the-gathering" },
    { title: "Shadowverse", slug: "shadowverse" },
    { title: "Riftbound", slug: "riftbound" },
];

// ── Tournament Templates ────────────────────────────────────────────
const TOURNAMENT_TEMPLATES = [
    {
        name: "Weekly Yu-Gi-Oh! Championship",
        gameSlug: "yu-gi-oh",
        isRemote: false,
        venueAddress: "Akihabara Game Center 3F",
        venueCity: "Tokyo",
        venueCountry: "Japan",
        description: "Weekly championship series for competitive Yu-Gi-Oh! players.",
        entryFee: 0n,
        gmFee: 500,
        sponsorAmount: 100_000_000n,
        participantCount: 4,
        startAfterRegistration: true,
    },
    {
        name: "MTG Modern Masters",
        gameSlug: "magic-the-gathering",
        isRemote: false,
        venueAddress: "Card Kingdom",
        venueCity: "Seattle",
        venueCountry: "USA",
        description: "Modern format tournament with special prizes.",
        entryFee: 0n,
        gmFee: 300,
        sponsorAmount: 500_000_000n,
        participantCount: 8,
        startAfterRegistration: false,
    },
    {
        name: "Shadowverse Pro League Qualifiers",
        gameSlug: "shadowverse",
        isRemote: true,
        venueAddress: "",
        venueCity: "",
        venueCountry: "",
        description: "Qualify for the Shadowverse Pro League Season 5.",
        entryFee: 0n,
        gmFee: 200,
        sponsorAmount: 200_000_000n,
        participantCount: 4,
        startAfterRegistration: true,
    },
    {
        name: "Riftbound Launch Tournament",
        gameSlug: "riftbound",
        isRemote: true,
        venueAddress: "",
        venueCity: "",
        venueCountry: "",
        description: "Celebrate the launch of Riftbound with an inaugural tournament!",
        entryFee: 0n,
        gmFee: 0,
        sponsorAmount: 1_000_000_000n,
        participantCount: 6,
        startAfterRegistration: false,
    },
    {
        name: "Yu-Gi-Oh! Beginner's Cup",
        gameSlug: "yu-gi-oh",
        isRemote: false,
        venueAddress: "Community Center Hall B",
        venueCity: "Thessaloniki",
        venueCountry: "Greece",
        description: "Friendly tournament for new players looking to learn.",
        entryFee: 0n,
        gmFee: 100,
        sponsorAmount: 50_000_000n,
        participantCount: 3,
        startAfterRegistration: false,
    },
    {
        name: "MTG Draft Night",
        gameSlug: "magic-the-gathering",
        isRemote: false,
        venueAddress: "The Game Store",
        venueCity: "London",
        venueCountry: "UK",
        description: "Draft format tournament - all skill levels welcome!",
        entryFee: 0n,
        gmFee: 400,
        sponsorAmount: 100_000_000n,
        participantCount: 2,
        startAfterRegistration: true,
    },
    {
        name: "Shadowverse Grand Prix",
        gameSlug: "shadowverse",
        isRemote: false,
        venueAddress: "Tokyo Big Sight East Hall",
        venueCity: "Tokyo",
        venueCountry: "Japan",
        description: "Major tournament with significant prizes.",
        entryFee: 0n,
        gmFee: 300,
        sponsorAmount: 3_000_000_000n,
        participantCount: 8,
        startAfterRegistration: false,
    },
    {
        name: "Riftbound Online Open",
        gameSlug: "riftbound",
        isRemote: true,
        venueAddress: "",
        venueCity: "",
        venueCountry: "",
        description: "Open online tournament for Riftbound players worldwide.",
        entryFee: 0n,
        gmFee: 200,
        sponsorAmount: 200_000_000n,
        participantCount: 0,
        startAfterRegistration: false,
    },
];

// ── Helpers ─────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

function findCreatedObjectId(result: any, typeSubstring: string): string | null {
    const change = result.objectChanges?.find(
        (c: any) => c.type === "created" && c.objectType?.includes(typeSubstring)
    );
    return change && "objectId" in change ? change.objectId : null;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
    const args = process.argv.slice(2);
    const useTestnet = args.includes("--testnet");
    const network = useTestnet ? "testnet" : "devnet";
    const rpcUrl = useTestnet ? "https://fullnode.testnet.sui.io:443" : getFullnodeUrl("devnet");

    const privateKey = process.env.SUI_PRIVATE_KEY;
    if (!privateKey) {
        console.error("Error: SUI_PRIVATE_KEY environment variable is required");
        console.log("\nTo get your private key:");
        console.log("1. Run: sui keytool export --key-identity <your-address>");
        console.log("2. Set: export SUI_PRIVATE_KEY='suiprivkey1...'");
        process.exit(1);
    }

    if (!CONFIG.packageId || !CONFIG.platformConfigId || !CONFIG.gameRegistryId || !CONFIG.adminCapId) {
        console.error("Error: One or more required environment variables are missing.");
        console.error("Please ensure NUXT_PUBLIC_PACKAGE_ID, NUXT_PUBLIC_PLATFORM_CONFIG_ID, NUXT_PUBLIC_GAME_REGISTRY_ID, and NUXT_PUBLIC_ADMIN_CAP_ID are set.");
        process.exit(1);
    }

    const client = new SuiClient({ url: rpcUrl });
    const gmKeypair = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(privateKey).secretKey);
    const gmAddress = gmKeypair.getPublicKey().toSuiAddress();

    console.log(`\n🎮 Tournament Seeding Script`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`GM Address:  ${gmAddress}`);
    console.log(`Network:     ${network}`);
    console.log(`Package:     ${CONFIG.packageId.slice(0, 20)}...`);

    const balance = await client.getBalance({ owner: gmAddress });
    console.log(`Balance:     ${(Number(balance.totalBalance) / 1e9).toFixed(4)} SUI`);

    // ── Step 1: Register Games ──────────────────────────────────────
    console.log(`\n📝 Step 1: Registering Games`);

    // Check if we are likely the admin (simple check: do we own the AdminCap?)
    const adminCapObj = await client.getObject({
        id: CONFIG.adminCapId,
        options: { showOwner: true }
    });
    const owner = adminCapObj.data?.owner as { AddressOwner: string };
    const adminCapOwner = owner?.AddressOwner;
    const isAdmin = adminCapOwner === gmAddress;

    if (!isAdmin) {
        console.log(`   ℹ️  Skipping game registration (Signer is not AdminCap owner)`);
    } else {
        for (const game of GAMES) {
            const tx = new Transaction();
            tx.moveCall({
                target: `${CONFIG.packageId}::game_registry::add_game`,
                arguments: [
                    tx.object(CONFIG.gameRegistryId),
                    tx.object(CONFIG.adminCapId),
                    tx.pure.string(game.title),
                    tx.pure.string(game.slug),
                ],
            });

            try {
                await client.signAndExecuteTransaction({
                    signer: gmKeypair,
                    transaction: tx,
                    options: { showEffects: true },
                });
                console.log(`   ✅ ${game.title}`);
            } catch (e: any) {
                if (e.message?.includes("1004")) {
                    console.log(`   ℹ️  ${game.title} (already registered)`);
                } else {
                    console.warn(`   ⚠️  ${game.title}: ${e.message?.slice(0, 80)}`);
                }
            }
            await delay(300);
        }
    }

    // ── Step 2: Fee Update (Handled by deploy script now) ───────────
    // console.log(`\n💰 Step 2: Skipped (Handled by deploy script)`);

    // ── Step 3: Create Tournaments + Register Participants ──────────
    console.log(`\n🏆 Step 3: Creating Tournaments & Registering Participants`);
    const now = Date.now();
    const createdTournaments: { id: string; name: string; participants: number; started: boolean }[] = [];

    for (let i = 0; i < TOURNAMENT_TEMPLATES.length; i++) {
        const t = TOURNAMENT_TEMPLATES[i];
        console.log(`\n   ── Tournament ${i + 1}/${TOURNAMENT_TEMPLATES.length}: ${t.name} ──`);

        // 3a. Create tournament
        const createTx = new Transaction();
        const totalPayment = CONFIG.creationFee + t.sponsorAmount;
        const [paymentCoin] = createTx.splitCoins(createTx.gas, [totalPayment]);

        createTx.moveCall({
            target: `${CONFIG.packageId}::tournament::create_tournament`,
            arguments: [
                createTx.object(CONFIG.platformConfigId),
                createTx.object(CONFIG.gameRegistryId),
                createTx.pure.string(t.name),
                createTx.pure.bool(t.isRemote),
                createTx.pure.string(t.venueAddress),
                createTx.pure.string(t.venueCity),
                createTx.pure.string(t.venueCountry),
                createTx.pure.u64(now + (i * 86400000)),
                createTx.pure.string(t.gameSlug),
                createTx.pure.string(t.description),
                createTx.pure.u64(t.entryFee),
                createTx.pure.u64(t.gmFee),
                paymentCoin,
            ],
        });

        let tournamentId: string | null = null;
        try {
            const result = await client.signAndExecuteTransaction({
                signer: gmKeypair,
                transaction: createTx,
                options: { showEffects: true, showObjectChanges: true },
            });

            if (result.effects?.status.status !== "success") {
                console.log(`   ❌ Create failed: ${result.effects?.status.error}`);
                continue;
            }

            tournamentId = findCreatedObjectId(result, "Tournament");
            console.log(`   ✅ Created: ${tournamentId?.slice(0, 20)}...`);
        } catch (e: any) {
            console.log(`   ❌ Error: ${e.message?.slice(0, 80)}`);
            continue;
        }

        if (!tournamentId) continue;
        await delay(500);

        // 3b. Generate, fund & register participants
        let registeredCount = 0;
        if (t.participantCount > 0) {
            console.log(`   👥 Generating ${t.participantCount} participants...`);

            const participantKeypairs: Ed25519Keypair[] = [];
            const fundTx = new Transaction();
            const fundCoins = fundTx.splitCoins(
                fundTx.gas,
                Array(t.participantCount).fill(CONFIG.fundPerParticipant)
            );

            for (let j = 0; j < t.participantCount; j++) {
                const kp = new Ed25519Keypair();
                participantKeypairs.push(kp);
                fundTx.transferObjects([fundCoins[j]], kp.getPublicKey().toSuiAddress());
            }

            try {
                const fundRes = await client.signAndExecuteTransaction({
                    signer: gmKeypair,
                    transaction: fundTx,
                    options: { showEffects: true },
                });
                if (fundRes.effects?.status.status !== "success") {
                    console.log(`   ❌ Funding failed`);
                } else {
                    console.log(`   ✅ Funded ${t.participantCount} wallets`);
                }
            } catch (e: any) {
                console.log(`   ❌ Funding error: ${e.message?.slice(0, 80)}`);
            }

            await delay(500);

            // Register each participant
            for (let j = 0; j < participantKeypairs.length; j++) {
                const kp = participantKeypairs[j];
                const regTx = new Transaction();
                const [payCoin] = regTx.splitCoins(regTx.gas, [t.entryFee]);
                const username = `player_${j + 1}_${Math.floor(Math.random() * 1000)}`;

                regTx.moveCall({
                    target: `${CONFIG.packageId}::tournament::register`,
                    arguments: [
                        regTx.object(tournamentId),
                        regTx.pure.string(username),
                        payCoin
                    ],
                });

                try {
                    const res = await client.signAndExecuteTransaction({
                        signer: kp,
                        transaction: regTx,
                        options: { showEffects: true },
                    });
                    if (res.effects?.status.status === "success") {
                        registeredCount++;
                    } else {
                        console.log(`   ⚠️  Player ${j + 1} registration failed`);
                    }
                } catch (e: any) {
                    console.log(`   ⚠️  Player ${j + 1} error: ${e.message?.slice(0, 60)}`);
                }
                await delay(200);
            }
            console.log(`   ✅ Registered ${registeredCount}/${t.participantCount} participants`);
        }

        // 3c. Start tournament if configured and has >= 2 participants
        let started = false;
        if (t.startAfterRegistration && registeredCount >= 2) {
            const startTx = new Transaction();
            startTx.moveCall({
                target: `${CONFIG.packageId}::tournament::start_tournament`,
                arguments: [startTx.object(tournamentId)],
            });

            try {
                const startRes = await client.signAndExecuteTransaction({
                    signer: gmKeypair,
                    transaction: startTx,
                    options: { showEffects: true },
                });
                if (startRes.effects?.status.status === "success") {
                    started = true;
                    console.log(`   🚀 Tournament started!`);
                } else {
                    console.log(`   ⚠️  Start failed: ${startRes.effects?.status.error}`);
                }
            } catch (e: any) {
                console.log(`   ⚠️  Start error: ${e.message?.slice(0, 60)}`);
            }
            await delay(300);
        }

        createdTournaments.push({
            id: tournamentId,
            name: t.name,
            participants: registeredCount,
            started,
        });

        await delay(500);
    }

    // ── Summary ─────────────────────────────────────────────────────
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✨ Seeding Complete!`);
    console.log(`   Created: ${createdTournaments.length}/${TOURNAMENT_TEMPLATES.length}`);
    console.log(`\n📝 Tournaments:`);
    createdTournaments.forEach((t, i) => {
        const status = t.started ? "LIVE" : t.participants > 0 ? "OPEN (with players)" : "OPEN (empty)";
        console.log(`   ${i + 1}. ${t.name}`);
        console.log(`      ID: ${t.id}`);
        console.log(`      Participants: ${t.participants} | Status: ${status}`);
    });

    // Save deployment info
    const output = {
        packageId: CONFIG.packageId,
        platformConfigId: CONFIG.platformConfigId,
        gameRegistryId: CONFIG.gameRegistryId,
        adminCapId: CONFIG.adminCapId,
        gmAddress,
        tournaments: createdTournaments,
        createdAt: new Date().toISOString(),
    };

    fs.writeFileSync("./move/devnet-deployment.json", JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved to: ./move/devnet-deployment.json`);
}

main().catch(console.error);
