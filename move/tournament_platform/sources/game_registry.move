module tournament_platform::game_registry {
    use std::string::String;
    use tournament_platform::platform_config::AdminCap; // Removed Self (unused)

    // ============ VERSION TRACKING ============
    const VERSION: u64 = 1;

    // ============ ERROR CODES ============
    const EWrongVersion: u64 = 1000;
    // const ENotAdmin: u64 = 1001; // Removed unused constant
    const ENotUpgrade: u64 = 1002;
    const EGameNotFound: u64 = 1003;
    const EGameAlreadyExists: u64 = 1004;

    // ============ STRUCTS ============

    public struct GameRegistry has key {
        id: UID,
        version: u64,
        owner: address,
        games: vector<GameInfo>,
    }

    public struct GameInfo has store, copy, drop {
        name: String,
        slug: String,
        active: bool,
    }

    // ============ EVENTS ============

    public struct GameAdded has copy, drop {
        name: String,
        slug: String,
    }

    public struct GameStatusChanged has copy, drop {
        slug: String,
        active: bool,
    }

    // ============ INIT ============

    fun init(ctx: &mut TxContext) {
        // Create registry with a placeholder admin since we can't access platform_config's AdminCap here.
        // In a real system, we might use a separate SetupCap or just trust the contract deployment.
        // For simplicity and to match the spec's intent (shared object created at start), we create it here.
        let registry = GameRegistry {
            id: object::new(ctx),
            version: VERSION,
            owner: tx_context::sender(ctx),
            games: vector::empty(),
        };

        transfer::share_object(registry);
    }

    // ============ VERSION CHECK ============

    fun check_version(registry: &GameRegistry) {
        assert!(registry.version == VERSION, EWrongVersion);
    }

    // ============ ADMIN FUNCTIONS ============

    public fun add_game(
        registry: &mut GameRegistry,
        _admin_cap: &AdminCap,
        name: String,
        slug: String,
    ) {
        check_version(registry);
        // AdminCap ensures admin rights. 
        // We verify the AdminCap is valid by its type (guaranteed by Move).
        
        // Check game doesn't already exist
        let len = vector::length(&registry.games);
        let mut i = 0;
        while (i < len) {
            let game = vector::borrow(&registry.games, i);
            assert!(game.slug != slug, EGameAlreadyExists);
            i = i + 1;
        };

        vector::push_back(&mut registry.games, GameInfo {
            name,
            slug,
            active: true,
        });

        sui::event::emit(GameAdded { name, slug });
    }

    public fun deactivate_game(
        registry: &mut GameRegistry,
        _admin_cap: &AdminCap,
        slug: String,
    ) {
        check_version(registry);
        
        let len = vector::length(&registry.games);
        let mut i = 0;
        let mut found = false;
        while (i < len) {
            let game = vector::borrow_mut(&mut registry.games, i);
            if (game.slug == slug) {
                game.active = false;
                found = true;
                break
            };
            i = i + 1;
        };
        assert!(found, EGameNotFound);

        sui::event::emit(GameStatusChanged { slug, active: false });
    }

    public fun activate_game(
        registry: &mut GameRegistry,
        _admin_cap: &AdminCap,
        slug: String,
    ) {
        check_version(registry);
        
        let len = vector::length(&registry.games);
        let mut i = 0;
        let mut found = false;
        while (i < len) {
            let game = vector::borrow_mut(&mut registry.games, i);
            if (game.slug == slug) {
                game.active = true;
                found = true;
                break
            };
            i = i + 1;
        };
        assert!(found, EGameNotFound);

        sui::event::emit(GameStatusChanged { slug, active: true });
    }

    // ============ MIGRATION ============

    entry fun migrate(
        registry: &mut GameRegistry,
        _admin_cap: &AdminCap,
    ) {
        assert!(registry.version < VERSION, ENotUpgrade);
        registry.version = VERSION;
    }

    // ============ VIEW FUNCTIONS ============

    public fun is_game_supported(registry: &GameRegistry, slug: String): bool {
        let len = vector::length(&registry.games);
        let mut i = 0;
        while (i < len) {
            let game = vector::borrow(&registry.games, i);
            if (game.slug == slug && game.active) {
                return true
            };
            i = i + 1;
        };
        false
    }

    public fun get_games(registry: &GameRegistry): &vector<GameInfo> {
        &registry.games
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
