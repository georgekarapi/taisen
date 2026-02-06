/**
 * Tournament Seeding Script for Devnet
 * 
 * Run this script to create dummy tournaments with the connected wallet as GM.
 * 
 * Usage: npx tsx move/seed-tournaments.ts
 * 
 * Make sure to run from the wallet with address:
 * 0xc3601f88113a8a794401e92f4136fe605429deb55bce50ede9e10b373ab2fd8f
 */

import { Transaction } from "@mysten/sui/transactions";
import { SuiJsonRpcClient as SuiClient, getJsonRpcFullnodeUrl as getFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import * as fs from "node:fs";

// Configuration - Update these with your deployed values
const CONFIG = {
    packageId: "0x21a2ee0d2a1479d09072463fcb754bdcbba0fcc0d79ed2ee95a370bf3abd64e3",
    platformConfigId: "0xc9bd5e9d6083ec100f890d2dc23439fb27b9dbe1baeee9199001b8915f1a394a",
    gameRegistryId: "0x539ab612d1539421cb9784f96eabcf8e1c3a6b046d097d79c3a60b640b29e703",
    creationFee: 1_000_000n, // 0.001 SUI (1M MIST)
};

// Games from useGames.ts
const GAMES = [
    { title: "Yu-gi-oh!", slug: "yu-gi-oh" },
    { title: "Magic: The Gathering", slug: "magic-the-gathering" },
    { title: "Shadowverse", slug: "shadowverse" },
    { title: "Riftbound", slug: "riftbound" },
    { title: "Parallel", slug: "parallel" },
];

// Tournament templates - various statuses
const TOURNAMENT_TEMPLATES = [
    // OPEN tournaments (STATUS_OPEN = 0)
    {
        name: "Weekly Yu-Gi-Oh! Championship",
        gameSlug: "yu-gi-oh",
        location: "Tokyo Game Center",
        description: "Weekly championship series for competitive Yu-Gi-Oh! players.",
        entryFee: 10_000_000n, // 0.01 SUI
        gmFee: 500, // 5%
        sponsorAmount: 100_000_000n, // 0.1 SUI sponsor pool
    },
    {
        name: "MTG Modern Masters",
        gameSlug: "magic-the-gathering",
        location: "Card Kingdom Seattle",
        description: "Modern format tournament with special prizes.",
        entryFee: 50_000_000n, // 0.05 SUI
        gmFee: 300, // 3%
        sponsorAmount: 500_000_000n, // 0.5 SUI sponsor pool
    },
    {
        name: "Shadowverse Pro League Qualifiers",
        gameSlug: "shadowverse",
        location: "Online - Discord Server",
        description: "Qualify for the Shadowverse Pro League Season 5.",
        entryFee: 25_000_000n, // 0.025 SUI
        gmFee: 200, // 2%
        sponsorAmount: 200_000_000n,
    },
    {
        name: "Riftbound Launch Tournament",
        gameSlug: "riftbound",
        location: "Virtual Arena",
        description: "Celebrate the launch of Riftbound with an inaugural tournament!",
        entryFee: 0n, // Free entry
        gmFee: 0,
        sponsorAmount: 1_000_000_000n, // 1 SUI prize pool
    },
    {
        name: "Parallel Invitational",
        gameSlug: "parallel",
        location: "San Francisco Tech Hub",
        description: "Exclusive invitational for top Parallel players.",
        entryFee: 100_000_000n, // 0.1 SUI
        gmFee: 500,
        sponsorAmount: 2_000_000_000n, // 2 SUI
    },
    // Additional tournaments for variety
    {
        name: "Yu-Gi-Oh! Beginner's Cup",
        gameSlug: "yu-gi-oh",
        location: "Community Center",
        description: "Friendly tournament for new players looking to learn.",
        entryFee: 5_000_000n,
        gmFee: 100,
        sponsorAmount: 50_000_000n,
    },
    {
        name: "MTG Draft Night",
        gameSlug: "magic-the-gathering",
        location: "Local Game Store",
        description: "Draft format tournament - all skill levels welcome!",
        entryFee: 30_000_000n,
        gmFee: 400,
        sponsorAmount: 0n,
    },
    {
        name: "Shadowverse Grand Prix",
        gameSlug: "shadowverse",
        location: "Tokyo Convention Center",
        description: "Major tournament with significant prizes.",
        entryFee: 75_000_000n,
        gmFee: 300,
        sponsorAmount: 3_000_000_000n,
    },
];

async function main() {
    // Get private key from environment
    const privateKey = process.env.SUI_PRIVATE_KEY;
    if (!privateKey) {
        console.error("Error: SUI_PRIVATE_KEY environment variable is required");
        console.log("\nTo get your private key:");
        console.log("1. Run: sui keytool export --key-identity <your-address>");
        console.log("2. Set: export SUI_PRIVATE_KEY='suiprivkey1...'");
        process.exit(1);
    }

    // Initialize client and keypair
    const client = new SuiClient({ url: getFullnodeUrl("devnet") });

    let keypair: Ed25519Keypair;
    try {
        const { secretKey } = decodeSuiPrivateKey(privateKey);
        keypair = Ed25519Keypair.fromSecretKey(secretKey);
    } catch (e) {
        console.error("Error: Invalid private key format");
        process.exit(1);
    }

    const gmAddress = keypair.getPublicKey().toSuiAddress();
    console.log(`\n🎮 Tournament Seeding Script`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`GM Address: ${gmAddress}`);
    console.log(`Network: devnet`);
    console.log(`Package: ${CONFIG.packageId.slice(0, 15)}...`);

    // Verify GM address matches expected
    const expectedGM = "0xc3601f88113a8a794401e92f4136fe605429deb55bce50ede9e10b373ab2fd8f";
    if (gmAddress !== expectedGM) {
        console.warn(`\n⚠️  Warning: GM address mismatch`);
        console.warn(`   Expected: ${expectedGM}`);
        console.warn(`   Got:      ${gmAddress}`);
        console.log(`   Continuing anyway...`);
    }

    // Check balance
    const balance = await client.getBalance({ owner: gmAddress });
    console.log(`Balance: ${Number(balance.totalBalance) / 1e9} SUI`);

    // Calculate required funds
    let totalRequired = 0n;
    for (const t of TOURNAMENT_TEMPLATES) {
        totalRequired += CONFIG.creationFee + t.sponsorAmount;
    }
    console.log(`Required: ${Number(totalRequired) / 1e9} SUI\n`);

    if (BigInt(balance.totalBalance) < totalRequired) {
        console.error("❌ Insufficient balance. Please fund the wallet:");
        console.log(`   sui client faucet --address ${gmAddress}`);
        process.exit(1);
    }

    // Get coins for gas
    const coins = await client.getCoins({ owner: gmAddress });
    if (coins.data.length === 0) {
        console.error("❌ No coins available");
        process.exit(1);
    }

    const createdTournaments: string[] = [];
    const now = Date.now();

    for (let i = 0; i < TOURNAMENT_TEMPLATES.length; i++) {
        const t = TOURNAMENT_TEMPLATES[i];
        const game = GAMES.find(g => g.slug === t.gameSlug)!;

        console.log(`\n📋 Creating tournament ${i + 1}/${TOURNAMENT_TEMPLATES.length}:`);
        console.log(`   ${t.name} (${game.title})`);

        const tx = new Transaction();

        // Calculate total payment needed (creation fee + sponsor amount)
        const totalPayment = CONFIG.creationFee + t.sponsorAmount;

        // Split coin for payment
        const [paymentCoin] = tx.splitCoins(tx.gas, [totalPayment]);

        // Call create_tournament
        tx.moveCall({
            target: `${CONFIG.packageId}::tournament::create_tournament`,
            arguments: [
                tx.object(CONFIG.platformConfigId),
                tx.object(CONFIG.gameRegistryId),
                tx.pure.string(t.name),
                tx.pure.string(t.location),
                tx.pure.u64(now + (i * 86400000)), // Stagger dates by 1 day
                tx.pure.string(t.gameSlug),
                tx.pure.string(t.description),
                tx.pure.u64(t.entryFee),
                tx.pure.u64(t.gmFee),
                paymentCoin,
            ],
        });

        try {
            const result = await client.signAndExecuteTransaction({
                signer: keypair,
                transaction: tx,
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                },
            });

            if (result.effects?.status.status === "success") {
                // Find created tournament object
                const tournamentChange = result.objectChanges?.find(
                    (c) => c.type === "created" && c.objectType?.includes("Tournament")
                );

                const tournamentId = tournamentChange && 'objectId' in tournamentChange
                    ? tournamentChange.objectId
                    : "unknown";

                createdTournaments.push(tournamentId);
                console.log(`   ✅ Created: ${tournamentId.slice(0, 15)}...`);
            } else {
                console.log(`   ❌ Failed: ${result.effects?.status.error}`);
            }
        } catch (e: any) {
            console.log(`   ❌ Error: ${e.message}`);
        }

        // Small delay between transactions
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✨ Seeding complete!`);
    console.log(`   Created ${createdTournaments.length}/${TOURNAMENT_TEMPLATES.length} tournaments`);
    console.log(`\n📝 Tournament IDs:`);
    createdTournaments.forEach((id, i) => {
        console.log(`   ${i + 1}. ${id}`);
    });

    // Save tournament IDs to a file
    const output = {
        packageId: CONFIG.packageId,
        platformConfigId: CONFIG.platformConfigId,
        gameRegistryId: CONFIG.gameRegistryId,
        gmAddress,
        tournaments: createdTournaments,
        createdAt: new Date().toISOString(),
    };

    const fs = await import("fs");
    fs.writeFileSync(
        "./move/devnet-deployment.json",
        JSON.stringify(output, null, 2)
    );
    console.log(`\n💾 Saved to: ./move/devnet-deployment.json`);
}

main().catch(console.error);
