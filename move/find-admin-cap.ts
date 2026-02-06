
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import * as fs from "fs";

async function main() {
    console.log("Searching for AdminCap...");

    // 1. Get config
    const deployment = JSON.parse(fs.readFileSync("./move/devnet-deployment.json", "utf-8"));
    const gmAddress = deployment.gmAddress;
    const packageId = deployment.packageId;

    console.log(`GM Address: ${gmAddress}`);
    console.log(`Package ID: ${packageId}`);

    // 2. Setup client
    const client = new SuiClient({ url: getFullnodeUrl("devnet") });

    // 3. Fetch owned objects
    let hasNextPage = true;
    let cursor: string | null | undefined = null;

    while (hasNextPage) {
        const response = await client.getOwnedObjects({
            owner: gmAddress,
            options: { showType: true },
            cursor,
        });

        // 4. Find AdminCap
        const adminCap = response.data.find(obj =>
            obj.data?.type === `${packageId}::platform_config::AdminCap`
        );

        if (adminCap) {
            console.log("\nFOUND ADMIN CAP!");
            console.log(`ID: ${adminCap.data?.objectId}`);
            return;
        }

        hasNextPage = response.hasNextPage;
        cursor = response.nextCursor;
    }

    console.log("\nAdminCap not found in the first pages of owned objects.");
}

main().catch(console.error);
