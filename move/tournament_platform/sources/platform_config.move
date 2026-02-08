module tournament_platform::platform_config {
    use sui::event;

    // ============ VERSION TRACKING ============
    const VERSION: u64 = 1;

    // ============ ERROR CODES ============
    const EWrongVersion: u64 = 1000;
    const ENotAdmin: u64 = 1001;
    const ENotUpgrade: u64 = 1002;

    // ============ STRUCTS ============

    /// Admin capability for privileged operations
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Platform configuration (shared object)
    public struct PlatformConfig has key {
        id: UID,
        version: u64,
        admin: ID,
        owner: address,
        wallet: address,
        creation_fee: u64,      // Flat fee to create tournament (in MIST)
        platform_fee_bps: u64,  // % of prize pool (150 = 1.5%)
    }

    // ============ EVENTS ============

    public struct ConfigUpdated has copy, drop {
        wallet: address,
        creation_fee: u64,
        platform_fee_bps: u64,
    }

    // ============ INIT ============

    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        let admin_id = object::id(&admin_cap);

        let config = PlatformConfig {
            id: object::new(ctx),
            version: VERSION,
            admin: admin_id,
            owner: tx_context::sender(ctx),
            wallet: tx_context::sender(ctx),
            creation_fee: 2_000_000_000,  // 2 SUI (default for testnet/mainnet)
            platform_fee_bps: 150,         // 1.5%
        };

        transfer::share_object(config);
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ============ VERSION CHECK ============

    fun check_version(config: &PlatformConfig) {
        assert!(config.version == VERSION, EWrongVersion);
    }

    // ============ ADMIN FUNCTIONS ============

    public fun update_wallet(
        config: &mut PlatformConfig,
        admin_cap: &AdminCap,
        new_wallet: address,
    ) {
        check_version(config);
        assert!(config.admin == object::id(admin_cap), ENotAdmin);
        config.wallet = new_wallet;
        
        emit_config_updated(config);
    }

    public fun update_creation_fee(
        config: &mut PlatformConfig,
        admin_cap: &AdminCap,
        new_fee: u64,
    ) {
        check_version(config);
        assert!(config.admin == object::id(admin_cap), ENotAdmin);
        config.creation_fee = new_fee;
        
        emit_config_updated(config);
    }

    public fun update_platform_fee(
        config: &mut PlatformConfig,
        admin_cap: &AdminCap,
        new_fee_bps: u64,
    ) {
        check_version(config);
        assert!(config.admin == object::id(admin_cap), ENotAdmin);
        assert!(new_fee_bps <= 1000, 0); // Max 10%
        config.platform_fee_bps = new_fee_bps;
        
        emit_config_updated(config);
    }

    // ============ MIGRATION ============

    entry fun migrate(
        config: &mut PlatformConfig,
        admin_cap: &AdminCap,
    ) {
        assert!(config.admin == object::id(admin_cap), ENotAdmin);
        assert!(config.version < VERSION, ENotUpgrade);
        config.version = VERSION;
    }

    // ============ GETTERS ============

    public fun get_creation_fee(config: &PlatformConfig): u64 {
        config.creation_fee
    }

    public fun get_platform_fee_bps(config: &PlatformConfig): u64 {
        config.platform_fee_bps
    }

    public fun get_wallet(config: &PlatformConfig): address {
        config.wallet
    }

    // ============ HELPERS ============

    fun emit_config_updated(config: &PlatformConfig) {
        event::emit(ConfigUpdated {
            wallet: config.wallet,
            creation_fee: config.creation_fee,
            platform_fee_bps: config.platform_fee_bps,
        });
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
