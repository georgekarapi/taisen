#[test_only]
module tournament_platform::platform_config_tests {
    use sui::test_scenario;
    use tournament_platform::platform_config::{Self, AdminCap, PlatformConfig};

    const ADMIN: address = @0xAD;
    const NEW_WALLET: address = @0xBEEF;

    #[test]
    fun test_init_and_update() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // 1. Init
        {
            platform_config::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // 2. Check initial state
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            assert!(platform_config::get_creation_fee(&config) == 2_000_000_000, 0);
            assert!(platform_config::get_platform_fee_bps(&config) == 150, 1);
            test_scenario::return_shared(config);
        };

        // 3. Update fees
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            platform_config::update_creation_fee(&mut config, &admin_cap, 10_000_000_000);
            platform_config::update_platform_fee(&mut config, &admin_cap, 200);

            test_scenario::return_shared(config);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // 4. Verify updates
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            assert!(platform_config::get_creation_fee(&config) == 10_000_000_000, 2);
            assert!(platform_config::get_platform_fee_bps(&config) == 200, 3);
            test_scenario::return_shared(config);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_update_wallet() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        platform_config::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ADMIN);

        // Update wallet
        {
            let mut config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            platform_config::update_wallet(&mut config, &admin_cap, NEW_WALLET);
            assert!(platform_config::get_wallet(&config) == NEW_WALLET, 0);

            test_scenario::return_shared(config);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_platform_fee_at_max() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        platform_config::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ADMIN);

        // Set fee to max (10% = 1000 bps)
        {
            let mut config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            platform_config::update_platform_fee(&mut config, &admin_cap, 1000);
            assert!(platform_config::get_platform_fee_bps(&config) == 1000, 0);

            test_scenario::return_shared(config);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::end(scenario);
    }
}
