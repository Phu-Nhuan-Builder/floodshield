use anchor_lang::prelude::*;

declare_id!("5ShXP9aCrTv543G75JbANuwLyK6ukwK8QVrKMdY6msje");

/// FloodShield VN — Parametric Flood Payout Program (Solana Devnet)
///
/// Instructions:
///   1. initialize_authority  — one-time admin setup, stores payout config on-chain
///   2. trigger_payout        — authority-only SOL transfer to farmer wallet + on-chain record
///   3. verify_flood_zone     — oracle-style on-chain flood severity record
#[program]
pub mod flood_payout {
    use super::*;

    /// Initialize payout authority PDA (one-time, admin only).
    pub fn initialize_authority(
        ctx: Context<InitializeAuthority>,
        base_rate_lamports: u64,
        max_payout_lamports: u64,
    ) -> Result<()> {
        let cfg = &mut ctx.accounts.payout_config;
        cfg.authority = ctx.accounts.authority.key();
        cfg.base_rate_lamports = base_rate_lamports;
        cfg.max_payout_lamports = max_payout_lamports;
        cfg.total_paid_out = 0;
        cfg.payout_count = 0;
        cfg.bump = ctx.bumps.payout_config;

        emit!(AuthorityInitialized {
            authority: cfg.authority,
            base_rate_lamports,
            max_payout_lamports,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!(
            "FloodShield: authority initialized — base_rate={} lamports, max={}",
            base_rate_lamports,
            max_payout_lamports
        );
        Ok(())
    }

    /// Trigger a flood payout to a farmer wallet (authority-signed).
    /// Transfers SOL directly from authority to farmer via system program.
    pub fn trigger_payout(
        ctx: Context<TriggerPayout>,
        zone_id: String,
        land_area_ha_x100: u64, // land_area_ha * 100 to avoid floats (2.5 ha => 250)
        aid_type: u8,           // 0=rice_voucher, 1=fertilizer_voucher, 2=cash
        severity: u8,           // 0=low, 1=medium, 2=high, 3=critical
    ) -> Result<()> {
        require!(
            ctx.accounts.payout_config.authority == ctx.accounts.authority.key(),
            PayoutError::UnauthorizedAuthority
        );
        require!(land_area_ha_x100 > 0, PayoutError::InvalidLandArea);
        require!(severity <= 3, PayoutError::InvalidSeverity);
        require!(aid_type <= 2, PayoutError::InvalidAidType);
        require!(zone_id.len() <= 64, PayoutError::ZoneIdTooLong);

        let cfg = &ctx.accounts.payout_config;

        // Severity multiplier in basis points (÷100 later)
        let severity_multiplier: u64 = match severity {
            0 => 50,  // low:      0.5× base rate
            1 => 100, // medium:   1.0× base rate
            2 => 200, // high:     2.0× base rate
            3 => 300, // critical: 3.0× base rate
            _ => 100,
        };

        // amount = base_rate * (land_area/100) * (multiplier/100)
        let raw_amount = cfg
            .base_rate_lamports
            .saturating_mul(land_area_ha_x100)
            .saturating_mul(severity_multiplier)
            / 10_000;

        let amount_lamports = raw_amount.min(cfg.max_payout_lamports);
        require!(amount_lamports > 0, PayoutError::ZeroPayoutAmount);

        // SOL transfer: authority -> farmer via system program CPI
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            ctx.accounts.authority.key,
            ctx.accounts.farmer_wallet.key,
            amount_lamports,
        );
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.authority.to_account_info(),
                ctx.accounts.farmer_wallet.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Record payout on-chain
        let record = &mut ctx.accounts.payout_record;
        record.zone_id = zone_id.clone();
        record.farmer_wallet = ctx.accounts.farmer_wallet.key();
        record.amount_lamports = amount_lamports;
        record.aid_type = aid_type;
        record.severity = severity;
        record.land_area_ha_x100 = land_area_ha_x100;
        record.authority = ctx.accounts.authority.key();
        record.timestamp = Clock::get()?.unix_timestamp;
        record.bump = ctx.bumps.payout_record;

        // Update global counters
        let cfg_mut = &mut ctx.accounts.payout_config;
        cfg_mut.total_paid_out = cfg_mut.total_paid_out.saturating_add(amount_lamports);
        cfg_mut.payout_count = cfg_mut.payout_count.saturating_add(1);

        emit!(PayoutTriggered {
            zone_id,
            farmer_wallet: ctx.accounts.farmer_wallet.key(),
            amount_lamports,
            aid_type,
            severity,
            timestamp: record.timestamp,
        });

        msg!(
            "FloodShield: payout {} lamports -> {} (severity={}, aid_type={})",
            amount_lamports,
            ctx.accounts.farmer_wallet.key(),
            severity,
            aid_type
        );
        Ok(())
    }

    /// Record a verified flood zone on-chain (oracle/authority only).
    pub fn verify_flood_zone(
        ctx: Context<VerifyFloodZone>,
        zone_id: String,
        severity: u8,
        flood_extent_km2_x100: u64, // km2 * 100 (245.3 km2 => 24530)
        stac_item_id: String,
    ) -> Result<()> {
        require!(
            ctx.accounts.payout_config.authority == ctx.accounts.authority.key(),
            PayoutError::UnauthorizedAuthority
        );
        require!(severity <= 3, PayoutError::InvalidSeverity);
        require!(zone_id.len() <= 64, PayoutError::ZoneIdTooLong);
        require!(stac_item_id.len() <= 128, PayoutError::StacIdTooLong);

        let zone = &mut ctx.accounts.zone_record;
        zone.zone_id = zone_id.clone();
        zone.severity = severity;
        zone.flood_extent_km2_x100 = flood_extent_km2_x100;
        zone.stac_item_id = stac_item_id.clone();
        zone.verified_at = Clock::get()?.unix_timestamp;
        zone.verified_by = ctx.accounts.authority.key();
        // Only set bump on fresh init; init_if_needed reuses existing bump on re-verification
        if zone.bump == 0 {
            zone.bump = ctx.bumps.zone_record;
        }

        emit!(ZoneVerified {
            zone_id,
            severity,
            flood_extent_km2_x100,
            stac_item_id,
            timestamp: zone.verified_at,
        });

        msg!(
            "FloodShield: zone verified — id={}, severity={}, extent_x100={}",
            zone.zone_id,
            severity,
            flood_extent_km2_x100
        );
        Ok(())
    }
}

// ─── Account Structs ────────────────────────────────────────────────────────

/// Global config PDA seeds: ["payout_config"]
#[account]
#[derive(Default)]
pub struct PayoutConfig {
    pub authority: Pubkey,         // 32
    pub base_rate_lamports: u64,   // 8
    pub max_payout_lamports: u64,  // 8
    pub total_paid_out: u64,       // 8
    pub payout_count: u64,         // 8
    pub bump: u8,                  // 1
}
impl PayoutConfig {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 8 + 1; // 73
}

/// Payout record PDA seeds: ["payout_record", farmer_wallet, zone_id]
#[account]
#[derive(Default)]
pub struct PayoutRecord {
    pub zone_id: String,            // 4+64
    pub farmer_wallet: Pubkey,      // 32
    pub amount_lamports: u64,       // 8
    pub aid_type: u8,               // 1
    pub severity: u8,               // 1
    pub land_area_ha_x100: u64,     // 8
    pub authority: Pubkey,          // 32
    pub timestamp: i64,             // 8
    pub bump: u8,                   // 1
}
impl PayoutRecord {
    pub const LEN: usize = 8 + (4 + 64) + 32 + 8 + 1 + 1 + 8 + 32 + 8 + 1; // 167
}

/// Zone record PDA seeds: ["zone_record", zone_id]
#[account]
#[derive(Default)]
pub struct ZoneRecord {
    pub zone_id: String,               // 4+64
    pub severity: u8,                  // 1
    pub flood_extent_km2_x100: u64,    // 8
    pub stac_item_id: String,          // 4+128
    pub verified_at: i64,              // 8
    pub verified_by: Pubkey,           // 32
    pub bump: u8,                      // 1
}
impl ZoneRecord {
    pub const LEN: usize = 8 + (4 + 64) + 1 + 8 + (4 + 128) + 8 + 32 + 1; // 258
}

// ─── Instruction Contexts ───────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeAuthority<'info> {
    #[account(
        init,
        payer = authority,
        space = PayoutConfig::LEN,
        seeds = [b"payout_config"],
        bump
    )]
    pub payout_config: Account<'info, PayoutConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(zone_id: String)]
pub struct TriggerPayout<'info> {
    #[account(
        mut,
        seeds = [b"payout_config"],
        bump = payout_config.bump
    )]
    pub payout_config: Account<'info, PayoutConfig>,

    #[account(
        init,
        payer = authority,
        space = PayoutRecord::LEN,
        seeds = [
            b"payout_record",
            farmer_wallet.key().as_ref(),
            zone_id.as_bytes(),
        ],
        bump
    )]
    pub payout_record: Account<'info, PayoutRecord>,

    /// CHECK: recipient wallet — only receiving SOL, no account validation required
    #[account(mut)]
    pub farmer_wallet: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(zone_id: String)]
pub struct VerifyFloodZone<'info> {
    #[account(
        seeds = [b"payout_config"],
        bump = payout_config.bump
    )]
    pub payout_config: Account<'info, PayoutConfig>,

    #[account(
        init_if_needed,
        payer = authority,
        space = ZoneRecord::LEN,
        seeds = [b"zone_record", zone_id.as_bytes()],
        bump
    )]
    pub zone_record: Account<'info, ZoneRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ─── Events ─────────────────────────────────────────────────────────────────

#[event]
pub struct AuthorityInitialized {
    pub authority: Pubkey,
    pub base_rate_lamports: u64,
    pub max_payout_lamports: u64,
    pub timestamp: i64,
}

#[event]
pub struct PayoutTriggered {
    pub zone_id: String,
    pub farmer_wallet: Pubkey,
    pub amount_lamports: u64,
    pub aid_type: u8,
    pub severity: u8,
    pub timestamp: i64,
}

#[event]
pub struct ZoneVerified {
    pub zone_id: String,
    pub severity: u8,
    pub flood_extent_km2_x100: u64,
    pub stac_item_id: String,
    pub timestamp: i64,
}

// ─── Errors ─────────────────────────────────────────────────────────────────

#[error_code]
pub enum PayoutError {
    #[msg("Signer is not the registered payout authority")]
    UnauthorizedAuthority,

    #[msg("Land area must be greater than zero")]
    InvalidLandArea,

    #[msg("Severity must be 0=low, 1=medium, 2=high, or 3=critical")]
    InvalidSeverity,

    #[msg("Aid type must be 0=rice, 1=fertilizer, or 2=cash")]
    InvalidAidType,

    #[msg("Calculated payout amount is zero; check base_rate and land_area")]
    ZeroPayoutAmount,

    #[msg("Zone ID must be 64 characters or fewer")]
    ZoneIdTooLong,

    #[msg("STAC item ID must be 128 characters or fewer")]
    StacIdTooLong,
}
