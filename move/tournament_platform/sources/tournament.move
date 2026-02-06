module tournament_platform::tournament {
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::event;
    use std::string::String;
    // use std::vector; // Unused alias warning
    // use std::option::{Self, Option}; // Unused alias warning

    use tournament_platform::platform_config::{Self, PlatformConfig};
    use tournament_platform::game_registry::{Self, GameRegistry};

    // ============ VERSION TRACKING ============
    const VERSION: u64 = 1;

    // ============ STATUS CONSTANTS ============
    const STATUS_OPEN: u8 = 0;
    const STATUS_IN_PROGRESS: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;

    const MATCH_PENDING: u8 = 0;
    const MATCH_READY: u8 = 1;
    const MATCH_COMPLETED: u8 = 2;
    const MATCH_BYE: u8 = 3;

    // ============ ERROR CODES ============
    const EWrongVersion: u64 = 1000;
    const ENotGameMaster: u64 = 1001;
    const EInvalidStatus: u64 = 1002;
    const EAlreadyRegistered: u64 = 1003;
    const EInsufficientPayment: u64 = 1004;
    const ENotEnoughPlayers: u64 = 1005;
    const EInvalidMatch: u64 = 1006;
    const EInvalidWinner: u64 = 1007;
    const EMatchNotReady: u64 = 1008;
    const EGameNotSupported: u64 = 1009;
    const EInvalidGmFee: u64 = 1010;
    const ENotUpgrade: u64 = 1011;

    // ============ STRUCTS ============

    public struct Tournament has key {
        id: UID,
        version: u64,
        game_master: address,
        name: String,
        location: String,
        date: u64,
        game_type: String,
        description: String,
        entry_fee: u64,
        gm_fee_bps: u64,
        sponsor_pool: Balance<SUI>,
        player_pool: Balance<SUI>,
        participants: vector<address>,
        status: u8,
        winner: Option<address>,
        current_round: u64,
        total_rounds: u64,
        matches: vector<Match>,
        matches_in_current_round: u64,
        matches_completed_in_current_round: u64,
    }

    public struct Match has store, copy, drop {
        match_id: u64,
        round: u64,
        player_a: Option<address>,
        player_b: Option<address>,
        winner: Option<address>,
        status: u8,
        next_match_id: Option<u64>,
        next_match_slot: u8,
    }

    // ============ EVENTS ============

    public struct TournamentCreated has copy, drop {
        tournament_id: ID,
        game_master: address,
        name: String,
        game_type: String,
        entry_fee: u64,
    }

    public struct PlayerRegistered has copy, drop {
        tournament_id: ID,
        player: address,
        total_participants: u64,
    }

    public struct TournamentStarted has copy, drop {
        tournament_id: ID,
        total_players: u64,
        total_rounds: u64,
    }

    public struct MatchResult has copy, drop {
        tournament_id: ID,
        match_id: u64,
        winner: address,
        round: u64,
    }

    public struct TournamentCompleted has copy, drop {
        tournament_id: ID,
        winner: address,
        prize_amount: u64,
    }

    public struct TournamentCancelled has copy, drop {
        tournament_id: ID,
        refunded_players: u64,
    }

    // ============ VERSION CHECK ============

    fun check_version(tournament: &Tournament) {
        assert!(tournament.version == VERSION, EWrongVersion);
    }

    // ============ CREATE TOURNAMENT ============

    public fun create_tournament(
        config: &PlatformConfig,
        registry: &GameRegistry,
        name: String,
        location: String,
        date: u64,
        game_type: String,
        description: String,
        entry_fee: u64,
        gm_fee_bps: u64,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        // Validate game is supported
        assert!(game_registry::is_game_supported(registry, game_type), EGameNotSupported);
        
        // Validate GM fee (max 50%)
        assert!(gm_fee_bps <= 5000, EInvalidGmFee);

        // Check payment covers creation fee + sponsor amount
        let creation_fee = platform_config::get_creation_fee(config);
        let payment_value = coin::value(&payment);
        assert!(payment_value >= creation_fee, EInsufficientPayment);

        // Split payment: creation fee to platform, rest to sponsor pool
        let mut payment_balance = coin::into_balance(payment);
        let creation_fee_balance = balance::split(&mut payment_balance, creation_fee);
        
        // Send creation fee to platform wallet
        let platform_wallet = platform_config::get_wallet(config);
        transfer::public_transfer(
            coin::from_balance(creation_fee_balance, ctx),
            platform_wallet
        );

        let tournament = Tournament {
            id: object::new(ctx),
            version: VERSION,
            game_master: tx_context::sender(ctx),
            name,
            location,
            date,
            game_type,
            description,
            entry_fee,
            gm_fee_bps,
            sponsor_pool: payment_balance,
            player_pool: balance::zero(),
            participants: vector::empty(),
            status: STATUS_OPEN,
            winner: option::none(),
            current_round: 0,
            total_rounds: 0,
            matches: vector::empty(),
            matches_in_current_round: 0,
            matches_completed_in_current_round: 0,
        };

        let tournament_id = object::id(&tournament);
        
        event::emit(TournamentCreated {
            tournament_id,
            game_master: tx_context::sender(ctx),
            name: tournament.name,
            game_type: tournament.game_type,
            entry_fee,
        });

        transfer::share_object(tournament);
    }

    // ============ REGISTER ============

    public fun register(
        tournament: &mut Tournament,
        payment: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        check_version(tournament);
        assert!(tournament.status == STATUS_OPEN, EInvalidStatus);

        let player = tx_context::sender(ctx);
        
        // Check not already registered
        let len = vector::length(&tournament.participants);
        let mut i = 0;
        while (i < len) {
            assert!(*vector::borrow(&tournament.participants, i) != player, EAlreadyRegistered);
            i = i + 1;
        };

        // Check payment
        assert!(coin::value(&payment) >= tournament.entry_fee, EInsufficientPayment);

        // Add to player pool
        let payment_balance = coin::into_balance(payment);
        balance::join(&mut tournament.player_pool, payment_balance);

        // Add participant
        vector::push_back(&mut tournament.participants, player);

        event::emit(PlayerRegistered {
            tournament_id: object::id(tournament),
            player,
            total_participants: vector::length(&tournament.participants),
        });
    }

    // ============ START TOURNAMENT ============

    public fun start_tournament(
        tournament: &mut Tournament,
        ctx: &mut TxContext,
    ) {
        check_version(tournament);
        assert!(tournament.status == STATUS_OPEN, EInvalidStatus);
        assert!(tx_context::sender(ctx) == tournament.game_master, ENotGameMaster);
        
        let num_players = vector::length(&tournament.participants);
        assert!(num_players >= 2, ENotEnoughPlayers);

        // Calculate rounds needed (log2 rounded up)
        let total_rounds = calculate_rounds(num_players);
        tournament.total_rounds = total_rounds;
        tournament.current_round = 1;
        tournament.status = STATUS_IN_PROGRESS;

        // Generate bracket
        generate_bracket(tournament);

        event::emit(TournamentStarted {
            tournament_id: object::id(tournament),
            total_players: num_players,
            total_rounds,
        });
    }

    // ============ REPORT MATCH RESULT ============

    public fun report_match_result(
        tournament: &mut Tournament,
        config: &PlatformConfig,
        match_id: u64,
        winner_address: address,
        ctx: &mut TxContext,
    ) {
        check_version(tournament);
        assert!(tournament.status == STATUS_IN_PROGRESS, EInvalidStatus);
        assert!(tx_context::sender(ctx) == tournament.game_master, ENotGameMaster);

        // Find and validate match
        let matches_len = vector::length(&tournament.matches);
        assert!(match_id < matches_len, EInvalidMatch);
        
        let match_ref = vector::borrow_mut(&mut tournament.matches, match_id);
        assert!(match_ref.status == MATCH_READY, EMatchNotReady);

        // Validate winner is one of the players
        let is_player_a = option::is_some(&match_ref.player_a) && 
                          *option::borrow(&match_ref.player_a) == winner_address;
        let is_player_b = option::is_some(&match_ref.player_b) && 
                          *option::borrow(&match_ref.player_b) == winner_address;
        assert!(is_player_a || is_player_b, EInvalidWinner);

        // Record result
        match_ref.winner = option::some(winner_address);
        match_ref.status = MATCH_COMPLETED;
        tournament.matches_completed_in_current_round = 
            tournament.matches_completed_in_current_round + 1;

        // Advance winner to next match if exists
        if (option::is_some(&match_ref.next_match_id)) {
            let next_id = *option::borrow(&match_ref.next_match_id);
            let slot = match_ref.next_match_slot;
            let next_match = vector::borrow_mut(&mut tournament.matches, next_id);
            
            if (slot == 0) {
                next_match.player_a = option::some(winner_address);
            } else {
                next_match.player_b = option::some(winner_address);
            };

            // Check if next match is ready
            if (option::is_some(&next_match.player_a) && option::is_some(&next_match.player_b)) {
                next_match.status = MATCH_READY;
            };
        };

        event::emit(MatchResult {
            tournament_id: object::id(tournament),
            match_id,
            winner: winner_address,
            round: tournament.current_round,
        });

        // Check if round is complete
        if (tournament.matches_completed_in_current_round >= tournament.matches_in_current_round) {
            // Check if tournament is complete (final match done)
            if (tournament.current_round >= tournament.total_rounds) {
                complete_tournament(tournament, config, winner_address, ctx);
            } else {
                // Advance to next round
                tournament.current_round = tournament.current_round + 1;
                count_matches_in_round(tournament);
            }
        }
    }

    // ============ COMPLETE TOURNAMENT ============

    fun complete_tournament(
        tournament: &mut Tournament,
        config: &PlatformConfig,
        winner: address,
        ctx: &mut TxContext,
    ) {
        tournament.status = STATUS_COMPLETED;
        tournament.winner = option::some(winner);

        // Calculate prize distribution
        let total_pool = balance::value(&tournament.sponsor_pool) + 
                        balance::value(&tournament.player_pool);
        
        // Platform fee (from total pool)
        let platform_fee_bps = platform_config::get_platform_fee_bps(config);
        let platform_fee = (total_pool * platform_fee_bps) / 10000;

        // GM fee (from player pool only)
        let player_pool_value = balance::value(&tournament.player_pool);
        let gm_fee = (player_pool_value * tournament.gm_fee_bps) / 10000;

        // Winner gets the rest
        let winner_prize = total_pool - platform_fee - gm_fee;

        // Transfer platform fee
        let platform_wallet = platform_config::get_wallet(config);
        if (platform_fee > 0) {
            let platform_coin = coin::take(&mut tournament.player_pool, platform_fee, ctx);
            transfer::public_transfer(platform_coin, platform_wallet);
        };

        // Transfer GM fee
        if (gm_fee > 0) {
            let gm_coin = coin::take(&mut tournament.player_pool, gm_fee, ctx);
            transfer::public_transfer(gm_coin, tournament.game_master);
        };

        // Transfer winner prize (combine both pools)
        let sponsor_balance = balance::withdraw_all(&mut tournament.sponsor_pool);
        balance::join(&mut tournament.player_pool, sponsor_balance);
        let winner_coin = coin::take(&mut tournament.player_pool, winner_prize, ctx);
        transfer::public_transfer(winner_coin, winner);

        event::emit(TournamentCompleted {
            tournament_id: object::id(tournament),
            winner,
            prize_amount: winner_prize,
        });
    }

    // ============ CANCEL TOURNAMENT ============

    public fun cancel_tournament(
        tournament: &mut Tournament,
        ctx: &mut TxContext,
    ) {
        check_version(tournament);
        assert!(tournament.status == STATUS_OPEN || tournament.status == STATUS_IN_PROGRESS, EInvalidStatus);
        assert!(tx_context::sender(ctx) == tournament.game_master, ENotGameMaster);

        tournament.status = STATUS_CANCELLED;

        // Refund all players
        let num_players = vector::length(&tournament.participants);
        let refund_per_player = if (num_players > 0) {
            balance::value(&tournament.player_pool) / num_players
        } else {
            0
        };

        let mut i = 0;
        while (i < num_players) {
            let player = *vector::borrow(&tournament.participants, i);
            if (refund_per_player > 0) {
                let refund = coin::take(&mut tournament.player_pool, refund_per_player, ctx);
                transfer::public_transfer(refund, player);
            };
            i = i + 1;
        };

        // Return sponsor pool to GM
        let sponsor_value = balance::value(&tournament.sponsor_pool);
        if (sponsor_value > 0) {
            let sponsor_refund = coin::take(&mut tournament.sponsor_pool, sponsor_value, ctx);
            transfer::public_transfer(sponsor_refund, tournament.game_master);
        };

        event::emit(TournamentCancelled {
            tournament_id: object::id(tournament),
            refunded_players: num_players,
        });
    }

    // ============ MIGRATION ============

    entry fun migrate(
        tournament: &mut Tournament,
        _admin_cap: &tournament_platform::platform_config::AdminCap,
    ) {
        assert!(tournament.version < VERSION, ENotUpgrade);
        tournament.version = VERSION;
    }

    // ============ HELPER FUNCTIONS ============

    fun calculate_rounds(num_players: u64): u64 {
        let mut rounds = 0u64;
        let mut n = num_players - 1;
        while (n > 0) {
            rounds = rounds + 1;
            n = n >> 1;
        };
        rounds
    }

    fun generate_bracket(tournament: &mut Tournament) {
        let num_players = vector::length(&tournament.participants);
        let total_rounds = tournament.total_rounds;
        
        // Calculate total matches: 2^rounds - 1
        let mut total_matches = 1u64;
        let mut r = 0u64;
        while (r < total_rounds) {
            total_matches = total_matches * 2;
            r = r + 1;
        };
        total_matches = total_matches - 1;

        // Create all matches
        let mut match_id = 0u64;
        while (match_id < total_matches) {
            let round = get_round_for_match(match_id, total_rounds);
            let next_match = if (match_id < total_matches - 1) {
                option::some((total_matches - 1 - (total_matches - 1 - match_id) / 2))
            } else {
                option::none()
            };
            let next_slot = ((match_id % 2) as u8);

            vector::push_back(&mut tournament.matches, Match {
                match_id,
                round,
                player_a: option::none(),
                player_b: option::none(),
                winner: option::none(),
                status: MATCH_PENDING,
                next_match_id: next_match,
                next_match_slot: next_slot,
            });
            match_id = match_id + 1;
        };

        // Seed first round matches
        let first_round_matches = (total_matches + 1) / 2;
        let mut player_index = 0u64;
        let mut match_index = 0u64;
        
        while (match_index < first_round_matches && player_index < num_players) {
            let match_ref = vector::borrow_mut(&mut tournament.matches, match_index);
            
            // Assign player A
            if (player_index < num_players) {
                match_ref.player_a = option::some(*vector::borrow(&tournament.participants, player_index));
                player_index = player_index + 1;
            };
            
            // Assign player B
            if (player_index < num_players) {
                match_ref.player_b = option::some(*vector::borrow(&tournament.participants, player_index));
                player_index = player_index + 1;
                match_ref.status = MATCH_READY;
            } else {
                // Bye - player A auto-advances
                match_ref.status = MATCH_BYE;
                let winner = *option::borrow(&match_ref.player_a);
                match_ref.winner = option::some(winner);
                
                // Advance to next match
                if (option::is_some(&match_ref.next_match_id)) {
                    let next_id = *option::borrow(&match_ref.next_match_id);
                    let slot = match_ref.next_match_slot;
                    let next_match = vector::borrow_mut(&mut tournament.matches, next_id);
                    if (slot == 0) {
                        next_match.player_a = option::some(winner);
                    } else {
                        next_match.player_b = option::some(winner);
                    };
                };
            };
            
            match_index = match_index + 1;
        };

        count_matches_in_round(tournament);
    }

    fun get_round_for_match(match_id: u64, total_rounds: u64): u64 {
        // First round has most matches, final round has 1
        let round = 1u64;
        let mut matches_before = 0u64;
        let mut matches_in_round = 1u64;
        
        // Calculate matches per round from final backwards
        let mut r = total_rounds;
        while (r > 0) {
            if (match_id < matches_before + matches_in_round) {
                return total_rounds - r + 1
            };
            matches_before = matches_before + matches_in_round;
            matches_in_round = matches_in_round * 2;
            r = r - 1;
        };
        
        round
    }

    fun count_matches_in_round(tournament: &mut Tournament) {
        let current_round = tournament.current_round;
        let mut count = 0u64;
        let mut completed = 0u64;
        
        let matches_len = vector::length(&tournament.matches);
        let mut i = 0;
        while (i < matches_len) {
            let match_ref = vector::borrow(&tournament.matches, i);
            if (match_ref.round == current_round) {
                if (match_ref.status != MATCH_BYE) {
                    count = count + 1;
                    if (match_ref.status == MATCH_COMPLETED) {
                        completed = completed + 1;
                    };
                };
            };
            i = i + 1;
        };
        
        tournament.matches_in_current_round = count;
        tournament.matches_completed_in_current_round = completed;
    }
}
