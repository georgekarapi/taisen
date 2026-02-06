#[test_only]
module tournament_platform::game_registry_tests {
    use sui::test_scenario;
    use std::string;
    use tournament_platform::platform_config::{Self, AdminCap};
    use tournament_platform::game_registry::{Self, GameRegistry};

    const ADMIN: address = @0xAD;

    #[test]
    fun test_game_management() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        // Setup config to get AdminCap
        platform_config::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ADMIN);

        // Setup registry
        game_registry::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ADMIN);

        // Add Game
        {
            let mut registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            game_registry::add_game(
                &mut registry,
                &admin_cap,
                string::utf8(b"Pokemon TCG"),
                string::utf8(b"pokemon-tcg")
            );

            assert!(game_registry::is_game_supported(&registry, string::utf8(b"pokemon-tcg")), 0);
            
            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // Deactivate Game
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            game_registry::deactivate_game(
                &mut registry,
                &admin_cap,
                string::utf8(b"pokemon-tcg")
            );

            assert!(!game_registry::is_game_supported(&registry, string::utf8(b"pokemon-tcg")), 1);

            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_activate_game() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        platform_config::init_for_testing(test_scenario::ctx(&mut scenario));
        game_registry::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ADMIN);

        // Add and deactivate game
        {
            let mut registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            game_registry::add_game(&mut registry, &admin_cap, string::utf8(b"MTG"), string::utf8(b"mtg"));
            game_registry::deactivate_game(&mut registry, &admin_cap, string::utf8(b"mtg"));
            assert!(!game_registry::is_game_supported(&registry, string::utf8(b"mtg")), 0);

            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // Reactivate game
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            game_registry::activate_game(&mut registry, &admin_cap, string::utf8(b"mtg"));
            assert!(game_registry::is_game_supported(&registry, string::utf8(b"mtg")), 1);

            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = game_registry::EGameAlreadyExists)]
    fun test_add_duplicate_game_fails() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        platform_config::init_for_testing(test_scenario::ctx(&mut scenario));
        game_registry::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ADMIN);

        {
            let mut registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            game_registry::add_game(&mut registry, &admin_cap, string::utf8(b"Game"), string::utf8(b"game"));
            // This should fail - duplicate slug
            game_registry::add_game(&mut registry, &admin_cap, string::utf8(b"Game 2"), string::utf8(b"game"));

            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = game_registry::EGameNotFound)]
    fun test_deactivate_nonexistent_game_fails() {
        let mut scenario = test_scenario::begin(ADMIN);
        
        platform_config::init_for_testing(test_scenario::ctx(&mut scenario));
        game_registry::init_for_testing(test_scenario::ctx(&mut scenario));
        test_scenario::next_tx(&mut scenario, ADMIN);

        {
            let mut registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);

            // This should fail - game doesn't exist
            game_registry::deactivate_game(&mut registry, &admin_cap, string::utf8(b"nonexistent"));

            test_scenario::return_shared(registry);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::end(scenario);
    }
}
