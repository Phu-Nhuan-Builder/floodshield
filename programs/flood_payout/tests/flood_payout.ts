import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FloodPayout } from "../target/types/flood_payout";
import { assert } from "chai";

describe("flood_payout — FloodShield VN", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FloodPayout as Program<FloodPayout>;
  const authority = provider.wallet as anchor.Wallet;

  // PDAs
  let payoutConfigPda: PublicKey;
  let payoutConfigBump: number;

  // Test data
  const BASE_RATE = new BN(10_000_000);   // 0.01 SOL per ha
  const MAX_PAYOUT = new BN(500_000_000); // 0.5 SOL cap
  const TEST_ZONE_ID = "dong-thap-tuyen-thap-2026";
  const TEST_STAC_ID = "S1A_IW_GRDH_1SDV_20240815T_MEKONG";
  const farmerKeypair = Keypair.generate();

  before(async () => {
    // Derive payout_config PDA
    [payoutConfigPda, payoutConfigBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("payout_config")],
      program.programId
    );

    // Fund farmer wallet for rent-exemption on devnet
    try {
      const sig = await provider.connection.requestAirdrop(
        farmerKeypair.publicKey,
        0.1 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig, "confirmed");
    } catch {
      // Airdrop may fail on devnet — farmer just receives SOL
    }
  });

  // ─── Test 1: Initialize Authority ────────────────────────────────────────

  it("initializes payout authority with correct config", async () => {
    const tx = await program.methods
      .initializeAuthority(BASE_RATE, MAX_PAYOUT)
      .accounts({
        payoutConfig: payoutConfigPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ initializeAuthority tx:", tx);

    const cfg = await program.account.payoutConfig.fetch(payoutConfigPda);
    assert.ok(cfg.authority.equals(authority.publicKey), "authority mismatch");
    assert.equal(cfg.baseRateLamports.toNumber(), BASE_RATE.toNumber(), "base_rate mismatch");
    assert.equal(cfg.maxPayoutLamports.toNumber(), MAX_PAYOUT.toNumber(), "max_payout mismatch");
    assert.equal(cfg.totalPaidOut.toNumber(), 0, "total_paid_out should start at 0");
    assert.equal(cfg.payoutCount.toNumber(), 0, "payout_count should start at 0");
    assert.equal(cfg.bump, payoutConfigBump, "bump mismatch");
  });

  // ─── Test 2: Verify Flood Zone ────────────────────────────────────────────

  it("records a verified flood zone on-chain", async () => {
    const [zoneRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("zone_record"), Buffer.from(TEST_ZONE_ID)],
      program.programId
    );

    const SEVERITY_HIGH = 2;
    const EXTENT_X100 = new BN(24530); // 245.30 km²

    const tx = await program.methods
      .verifyFloodZone(TEST_ZONE_ID, SEVERITY_HIGH, EXTENT_X100, TEST_STAC_ID)
      .accounts({
        payoutConfig: payoutConfigPda,
        zoneRecord: zoneRecordPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ verifyFloodZone tx:", tx);

    const zone = await program.account.zoneRecord.fetch(zoneRecordPda);
    assert.equal(zone.zoneId, TEST_ZONE_ID, "zone_id mismatch");
    assert.equal(zone.severity, SEVERITY_HIGH, "severity mismatch");
    assert.equal(zone.floodExtentKm2X100.toNumber(), EXTENT_X100.toNumber(), "extent mismatch");
    assert.equal(zone.stacItemId, TEST_STAC_ID, "stac_item_id mismatch");
    assert.ok(zone.verifiedBy.equals(authority.publicKey), "verified_by mismatch");
    assert.ok(zone.verifiedAt.toNumber() > 0, "verified_at should be set");
  });

  // ─── Test 3: Trigger Payout ───────────────────────────────────────────────

  it("triggers a payout and transfers SOL to farmer wallet", async () => {
    const LAND_AREA_HA_X100 = new BN(250);  // 2.5 ha
    const SEVERITY_HIGH = 2;
    const AID_TYPE_RICE = 0;

    const [payoutRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("payout_record"),
        farmerKeypair.publicKey.toBuffer(),
        Buffer.from(TEST_ZONE_ID),
      ],
      program.programId
    );

    const farmerBalanceBefore = await provider.connection.getBalance(farmerKeypair.publicKey);

    const tx = await program.methods
      .triggerPayout(TEST_ZONE_ID, LAND_AREA_HA_X100, AID_TYPE_RICE, SEVERITY_HIGH)
      .accounts({
        payoutConfig: payoutConfigPda,
        payoutRecord: payoutRecordPda,
        farmerWallet: farmerKeypair.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ triggerPayout tx:", tx);
    console.log(`   Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);

    const farmerBalanceAfter = await provider.connection.getBalance(farmerKeypair.publicKey);
    // Expected: base_rate(10_000_000) * land_area(250) * severity_mult(200) / 10_000 = 50_000_000 lamports = 0.05 SOL
    const expectedPayout = 50_000_000;
    assert.equal(
      farmerBalanceAfter - farmerBalanceBefore,
      expectedPayout,
      `farmer should receive ${expectedPayout} lamports`
    );

    const record = await program.account.payoutRecord.fetch(payoutRecordPda);
    assert.equal(record.zoneId, TEST_ZONE_ID, "zone_id mismatch");
    assert.ok(record.farmerWallet.equals(farmerKeypair.publicKey), "farmer_wallet mismatch");
    assert.equal(record.amountLamports.toNumber(), expectedPayout, "amount_lamports mismatch");
    assert.equal(record.aidType, AID_TYPE_RICE, "aid_type mismatch");
    assert.equal(record.severity, SEVERITY_HIGH, "severity mismatch");

    const cfg = await program.account.payoutConfig.fetch(payoutConfigPda);
    assert.equal(cfg.payoutCount.toNumber(), 1, "payout_count should be 1");
    assert.equal(cfg.totalPaidOut.toNumber(), expectedPayout, "total_paid_out mismatch");
  });

  // ─── Test 4: Authority Guard ──────────────────────────────────────────────

  it("rejects trigger_payout from non-authority signer", async () => {
    const impostor = Keypair.generate();
    const randomFarmer = Keypair.generate();
    const ZONE_ID_2 = "an-giang-test-unauthorized";

    const [payoutRecordPda2] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("payout_record"),
        randomFarmer.publicKey.toBuffer(),
        Buffer.from(ZONE_ID_2),
      ],
      program.programId
    );

    try {
      await program.methods
        .triggerPayout(ZONE_ID_2, new BN(100), 0, 1)
        .accounts({
          payoutConfig: payoutConfigPda,
          payoutRecord: payoutRecordPda2,
          farmerWallet: randomFarmer.publicKey,
          authority: impostor.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([impostor])
        .rpc();

      assert.fail("Should have rejected unauthorized authority");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      assert.include(errMsg, "unauthorized", "Expected UnauthorizedAuthority error");
      console.log("✅ Unauthorized signer correctly rejected");
    }
  });

  // ─── Test 5: Max Payout Cap ───────────────────────────────────────────────

  it("caps payout at max_payout_lamports", async () => {
    // 100 ha at high severity = 10_000_000 * 10000 * 200 / 10_000 = 2_000_000_000 (2 SOL)
    // But max is 500_000_000 (0.5 SOL) so should be capped
    const bigFarmer = Keypair.generate();
    const ZONE_ID_3 = "kien-giang-big-farm-2026";
    const BIG_LAND = new BN(10_000); // 100 ha * 100

    const [payoutRecordPda3] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("payout_record"),
        bigFarmer.publicKey.toBuffer(),
        Buffer.from(ZONE_ID_3),
      ],
      program.programId
    );

    const balanceBefore = await provider.connection.getBalance(bigFarmer.publicKey);

    const tx = await program.methods
      .triggerPayout(ZONE_ID_3, BIG_LAND, 2, 2) // rice, high severity
      .accounts({
        payoutConfig: payoutConfigPda,
        payoutRecord: payoutRecordPda3,
        farmerWallet: bigFarmer.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const balanceAfter = await provider.connection.getBalance(bigFarmer.publicKey);
    const received = balanceAfter - balanceBefore;

    // Should be capped at max_payout (0.5 SOL = 500_000_000 lamports)
    assert.equal(received, MAX_PAYOUT.toNumber(), `payout should be capped at ${MAX_PAYOUT.toNumber()} lamports`);
    console.log("✅ Max payout cap enforced:", received, "lamports");
    console.log(`   Solana Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  });
});
