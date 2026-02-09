#[test_only]
module tournament_platform::tournament_tests {
    use sui::test_scenario;
    use sui::coin;
    use sui::sui::SUI;
    use std::string;
    use tournament_platform::platform_config::{Self, AdminCap, PlatformConfig};
    use tournament_platform::game_registry::{Self, GameRegistry};
    use tournament_platform::tournament::{Self, Tournament};

    const ADMIN: address = @0xAD;
    const GM: address = @0x6D;
    const PLAYER1: address = @0x1;
    const PLAYER2: address = @0x2;
    const PLAYER3: address = @0x3;

    // Helper to setup platform and registry
    fun setup_platform(scenario: &mut test_scenario::Scenario) {
        platform_config::init_for_testing(test_scenario::ctx(scenario));
        game_registry::init_for_testing(test_scenario::ctx(scenario));
        test_scenario::next_tx(scenario, ADMIN);
        
        let mut registry = test_scenario::take_shared<GameRegistry>(scenario);
        let admin_cap = test_scenario::take_from_sender<AdminCap>(scenario);
        game_registry::add_game(&mut registry, &admin_cap, string::utf8(b"Game"), string::utf8(b"game"));
        test_scenario::return_shared(registry);
        test_scenario::return_to_sender(scenario, admin_cap);
    }

    #[test]
    fun test_tournament_lifecycle() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_platform(&mut scenario);

        // Create Tournament (GM)
        test_scenario::next_tx(&mut scenario, GM);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let payment = coin::mint_for_testing<SUI>(15_000_000_000, test_scenario::ctx(&mut scenario));

            tournament::create_tournament(
                &config,
                &registry,
                string::utf8(b"Tourney 1"),
                true,
                string::utf8(b""),
                string::utf8(b""),
                string::utf8(b""),
                1000,
                string::utf8(b"game"),
                string::utf8(b"Desc"),
                1_000_000_000,
                1000,
                payment,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(config);
            test_scenario::return_shared(registry);
        };

        // Register Players
        test_scenario::next_tx(&mut scenario, PLAYER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::next_tx(&mut scenario, PLAYER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        // Start Tournament
        test_scenario::next_tx(&mut scenario, GM);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::start_tournament(&mut tournament, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        // Report Result (Player 1 wins)
        test_scenario::next_tx(&mut scenario, GM);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            
            tournament::report_match_result(
                &mut tournament,
                &config,
                0,
                PLAYER1,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(tournament);
            test_scenario::return_shared(config);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_cancel_tournament() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_platform(&mut scenario);

        // Create Tournament
        test_scenario::next_tx(&mut scenario, GM);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000_000_000, test_scenario::ctx(&mut scenario));

            tournament::create_tournament(
                &config, &registry,
                string::utf8(b"Cancel Test"),
                false,
                string::utf8(b"123 Main St"),
                string::utf8(b"Test City"),
                string::utf8(b"Test Country"),
                1000,
                string::utf8(b"game"),
                string::utf8(b"Desc"),
                1_000_000_000, 500, payment,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(config);
            test_scenario::return_shared(registry);
        };

        // Register a player
        test_scenario::next_tx(&mut scenario, PLAYER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        // Cancel tournament
        test_scenario::next_tx(&mut scenario, GM);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::cancel_tournament(&mut tournament, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = tournament::EAlreadyRegistered)]
    fun test_double_registration_fails() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_platform(&mut scenario);

        // Create Tournament
        test_scenario::next_tx(&mut scenario, GM);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000_000_000, test_scenario::ctx(&mut scenario));

            tournament::create_tournament(
                &config, &registry,
                string::utf8(b"Test"),
                true,
                string::utf8(b""),
                string::utf8(b""),
                string::utf8(b""),
                1000,
                string::utf8(b"game"),
                string::utf8(b"Desc"),
                1_000_000_000, 500, payment,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(config);
            test_scenario::return_shared(registry);
        };

        // Register once
        test_scenario::next_tx(&mut scenario, PLAYER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        // Try to register again - should fail
        test_scenario::next_tx(&mut scenario, PLAYER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = tournament::EInsufficientPayment)]
    fun test_insufficient_entry_fee_fails() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_platform(&mut scenario);

        // Create Tournament with 1 SUI entry fee
        test_scenario::next_tx(&mut scenario, GM);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000_000_000, test_scenario::ctx(&mut scenario));

            tournament::create_tournament(
                &config, &registry,
                string::utf8(b"Test"),
                false,
                string::utf8(b"456 Arena Blvd"),
                string::utf8(b"Tokyo"),
                string::utf8(b"Japan"),
                1000,
                string::utf8(b"game"),
                string::utf8(b"Desc"),
                1_000_000_000, 500, payment,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(config);
            test_scenario::return_shared(registry);
        };

        // Try to register with insufficient payment
        test_scenario::next_tx(&mut scenario, PLAYER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(500_000_000, test_scenario::ctx(&mut scenario)); // Only 0.5 SUI
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = tournament::ENotEnoughPlayers)]
    fun test_start_with_one_player_fails() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_platform(&mut scenario);

        // Create Tournament
        test_scenario::next_tx(&mut scenario, GM);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000_000_000, test_scenario::ctx(&mut scenario));

            tournament::create_tournament(
                &config, &registry,
                string::utf8(b"Test"),
                true,
                string::utf8(b""),
                string::utf8(b""),
                string::utf8(b""),
                1000,
                string::utf8(b"game"),
                string::utf8(b"Desc"),
                1_000_000_000, 500, payment,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(config);
            test_scenario::return_shared(registry);
        };

        // Register only one player
        test_scenario::next_tx(&mut scenario, PLAYER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        // Try to start - should fail (need at least 2 players)
        test_scenario::next_tx(&mut scenario, GM);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::start_tournament(&mut tournament, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_three_player_tournament() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_platform(&mut scenario);

        // Create Tournament
        test_scenario::next_tx(&mut scenario, GM);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let payment = coin::mint_for_testing<SUI>(10_000_000_000, test_scenario::ctx(&mut scenario));

            tournament::create_tournament(
                &config, &registry,
                string::utf8(b"3P Tournament"),
                false,
                string::utf8(b"789 Game Center"),
                string::utf8(b"Thessaloniki"),
                string::utf8(b"Greece"),
                1000,
                string::utf8(b"game"),
                string::utf8(b"Desc"),
                1_000_000_000, 500, payment,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(config);
            test_scenario::return_shared(registry);
        };

        // Register 3 players
        test_scenario::next_tx(&mut scenario, PLAYER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::next_tx(&mut scenario, PLAYER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::next_tx(&mut scenario, PLAYER3);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"player1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        // Start Tournament (should create bracket for 3 players with bye)
        test_scenario::next_tx(&mut scenario, GM);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            tournament::start_tournament(&mut tournament, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };
        test_scenario::end(scenario);
    }

    #[test]
    fun test_admin_overrides() {
        let mut scenario = test_scenario::begin(ADMIN);
        setup_platform(&mut scenario);

        // Create Tournament (GM)
        test_scenario::next_tx(&mut scenario, GM);
        {
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let registry = test_scenario::take_shared<GameRegistry>(&scenario);
            let payment = coin::mint_for_testing<SUI>(15_000_000_000, test_scenario::ctx(&mut scenario));

            tournament::create_tournament(
                &config,
                &registry,
                string::utf8(b"Admin Test"),
                true,
                string::utf8(b""),
                string::utf8(b""),
                string::utf8(b""),
                1000,
                string::utf8(b"game"),
                string::utf8(b"Desc"),
                1_000_000_000,
                1000,
                payment,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(config);
            test_scenario::return_shared(registry);
        };

        // Register Players
        test_scenario::next_tx(&mut scenario, PLAYER1);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"p1"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::next_tx(&mut scenario, PLAYER2);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"p2"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        test_scenario::next_tx(&mut scenario, PLAYER3);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let payment = coin::mint_for_testing<SUI>(1_000_000_000, test_scenario::ctx(&mut scenario));
            tournament::register(&mut tournament, string::utf8(b"p3"), payment, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
        };

        // Start Tournament (ADMIN override)
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            tournament::admin_start_tournament(&mut tournament, &admin_cap, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // Report Result (ADMIN override)
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let config = test_scenario::take_shared<PlatformConfig>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            
            tournament::admin_report_match_result(
                &mut tournament,
                &config,
                &admin_cap,
                0,
                PLAYER1,
                test_scenario::ctx(&mut scenario)
            );

            test_scenario::return_shared(tournament);
            test_scenario::return_shared(config);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        // Cancel Tournament (ADMIN override)
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut tournament = test_scenario::take_shared<Tournament>(&scenario);
            let admin_cap = test_scenario::take_from_sender<AdminCap>(&scenario);
            tournament::admin_cancel_tournament(&mut tournament, &admin_cap, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(tournament);
            test_scenario::return_to_sender(&scenario, admin_cap);
        };

        test_scenario::end(scenario);
    }
}
