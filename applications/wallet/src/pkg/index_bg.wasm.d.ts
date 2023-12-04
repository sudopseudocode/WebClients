/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_detailledwasmerror_free(a: number): void;
export function __wbg_get_detailledwasmerror_kind(a: number): number;
export function __wbg_set_detailledwasmerror_kind(a: number, b: number): void;
export function __wbg_get_detailledwasmerror_details(a: number): number;
export function __wbg_set_detailledwasmerror_details(a: number, b: number): void;
export function __wbg_wasmaddressinfo_free(a: number): void;
export function wasmaddressinfo_index(a: number): number;
export function wasmaddressinfo_to_string(a: number, b: number): void;
export function __wbg_exportedstringvec_free(a: number): void;
export function exportedstringvec_get_name(a: number, b: number, c: number): void;
export function __wbg_wasmderivationpath_free(a: number): void;
export function wasmderivationpath_new(a: number, b: number, c: number): void;
export function __wbg_wasmbalance_free(a: number): void;
export function __wbg_get_wasmbalance_immature(a: number): number;
export function __wbg_set_wasmbalance_immature(a: number, b: number): void;
export function __wbg_get_wasmbalance_trusted_pending(a: number): number;
export function __wbg_set_wasmbalance_trusted_pending(a: number, b: number): void;
export function __wbg_get_wasmbalance_untrusted_pending(a: number): number;
export function __wbg_set_wasmbalance_untrusted_pending(a: number, b: number): void;
export function __wbg_get_wasmbalance_confirmed(a: number): number;
export function __wbg_set_wasmbalance_confirmed(a: number, b: number): void;
export function __wbg_wasmlocktime_free(a: number): void;
export function wasmlocktime_fromHeight(a: number): number;
export function wasmlocktime_fromSeconds(a: number): number;
export function wasmlocktime_is_block_height(a: number): number;
export function wasmlocktime_is_block_time(a: number): number;
export function wasmlocktime_to_consensus_u32(a: number): number;
export function __wbg_wasmtxbuilder_free(a: number): void;
export function __wbg_wasmpartiallysignedtransaction_free(a: number): void;
export function wasmtxbuilder_new(): number;
export function wasmtxbuilder_add_recipient(a: number, b: number, c: number): number;
export function wasmtxbuilder_remove_recipient(a: number, b: number): number;
export function wasmtxbuilder_update_recipient(a: number, b: number, c: number, d: number, e: number): number;
export function wasmtxbuilder_add_unspendable_utxo(a: number, b: number, c: number): void;
export function wasmtxbuilder_remove_unspendable_utxo(a: number, b: number, c: number): void;
export function wasmtxbuilder_add_utxo_to_spend(a: number, b: number, c: number): void;
export function wasmtxbuilder_remove_utxo_to_spend(a: number, b: number, c: number): void;
export function wasmtxbuilder_manually_selected_only(a: number): number;
export function wasmtxbuilder_do_not_spend_change(a: number): number;
export function wasmtxbuilder_only_spend_change(a: number): number;
export function wasmtxbuilder_allow_spend_both(a: number): number;
export function wasmtxbuilder_fee_rate(a: number, b: number): number;
export function wasmtxbuilder_fee_absolute(a: number, b: number): number;
export function wasmtxbuilder_create_pbst(a: number, b: number, c: number): void;
export function __wbg_wasmwallet_free(a: number): void;
export function __wbg_wasmwalletconfig_free(a: number): void;
export function __wbg_get_wasmwalletconfig_network(a: number): number;
export function __wbg_set_wasmwalletconfig_network(a: number, b: number): void;
export function wasmwalletconfig_new(a: number): number;
export function wasmwallet_new(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function wasmwallet_add_account(a: number, b: number, c: number): number;
export function wasmwallet_get_balance(a: number): number;
export function wasmwallet_get_fingerprint(a: number, b: number): void;
export function __wbg_wasmpagination_free(a: number): void;
export function __wbg_get_wasmpagination_skip(a: number): number;
export function __wbg_set_wasmpagination_skip(a: number, b: number): void;
export function __wbg_get_wasmpagination_take(a: number): number;
export function __wbg_set_wasmpagination_take(a: number, b: number): void;
export function wasmpagination_new(a: number, b: number): number;
export function library_version(a: number): void;
export function __wbg_wasmscript_free(a: number): void;
export function __wbg_get_wasmscript_0(a: number, b: number): void;
export function __wbg_set_wasmscript_0(a: number, b: number, c: number): void;
export function __wbg_wasmoutpoint_free(a: number): void;
export function __wbg_wasmsequence_free(a: number): void;
export function __wbg_get_wasmsequence_0(a: number): number;
export function __wbg_set_wasmsequence_0(a: number, b: number): void;
export function __wbg_wasmtxin_free(a: number): void;
export function __wbg_get_wasmtxin_previous_output(a: number): number;
export function __wbg_set_wasmtxin_previous_output(a: number, b: number): void;
export function __wbg_get_wasmtxin_script_sig(a: number): number;
export function __wbg_set_wasmtxin_script_sig(a: number, b: number): void;
export function __wbg_get_wasmtxin_sequence(a: number): number;
export function __wbg_set_wasmtxin_sequence(a: number, b: number): void;
export function __wbg_wasmtxout_free(a: number): void;
export function __wbg_get_wasmtxout_value(a: number): number;
export function __wbg_set_wasmtxout_value(a: number, b: number): void;
export function __wbg_get_wasmtxout_script_pubkey(a: number): number;
export function __wbg_set_wasmtxout_script_pubkey(a: number, b: number): void;
export function __wbg_wasmtransaction_free(a: number): void;
export function __wbg_get_wasmtransaction_version(a: number): number;
export function __wbg_set_wasmtransaction_version(a: number, b: number): void;
export function __wbg_get_wasmtransaction_lock_time(a: number): number;
export function __wbg_set_wasmtransaction_lock_time(a: number, b: number): void;
export function __wbg_get_wasmtransaction_input(a: number, b: number): void;
export function __wbg_set_wasmtransaction_input(a: number, b: number, c: number): void;
export function __wbg_get_wasmtransaction_output(a: number, b: number): void;
export function __wbg_set_wasmtransaction_output(a: number, b: number, c: number): void;
export function __wbg_wasmconfirmation_free(a: number): void;
export function __wbg_get_wasmconfirmation_confirmed(a: number): number;
export function __wbg_set_wasmconfirmation_confirmed(a: number, b: number): void;
export function __wbg_get_wasmconfirmation_confirmation_time(a: number, b: number): void;
export function __wbg_set_wasmconfirmation_confirmation_time(a: number, b: number, c: number): void;
export function __wbg_get_wasmconfirmation_last_seen(a: number, b: number): void;
export function __wbg_set_wasmconfirmation_last_seen(a: number, b: number, c: number): void;
export function __wbg_wasmsimpletransaction_free(a: number): void;
export function __wbg_get_wasmsimpletransaction_txid(a: number, b: number): void;
export function __wbg_set_wasmsimpletransaction_txid(a: number, b: number, c: number): void;
export function __wbg_get_wasmsimpletransaction_value(a: number): number;
export function __wbg_set_wasmsimpletransaction_value(a: number, b: number): void;
export function __wbg_get_wasmsimpletransaction_confirmation(a: number): number;
export function __wbg_set_wasmsimpletransaction_confirmation(a: number, b: number): void;
export function __wbg_set_wasmsimpletransaction_fees(a: number, b: number, c: number): void;
export function __wbg_get_wasmsimpletransaction_fees(a: number, b: number): void;
export function __wbg_wasmaccount_free(a: number): void;
export function __wbg_wasmaccountconfig_free(a: number): void;
export function __wbg_get_wasmaccountconfig_bip(a: number): number;
export function __wbg_set_wasmaccountconfig_bip(a: number, b: number): void;
export function __wbg_get_wasmaccountconfig_network(a: number): number;
export function __wbg_set_wasmaccountconfig_network(a: number, b: number): void;
export function __wbg_get_wasmaccountconfig_account_index(a: number): number;
export function __wbg_set_wasmaccountconfig_account_index(a: number, b: number): void;
export function wasmaccountconfig_new(a: number, b: number, c: number, d: number): number;
export function wasmaccount_new(a: number, b: number, c: number, d: number, e: number, f: number): void;
export function wasmaccount_sync(a: number): number;
export function wasmaccount_get_balance(a: number): number;
export function wasmaccount_get_transactions(a: number, b: number, c: number): void;
export function __wbg_wasmmnemonic_free(a: number): void;
export function wasmmnemonic_new(a: number, b: number): void;
export function wasmmnemonic_fromString(a: number, b: number, c: number): void;
export function wasmmnemonic_fromEntropy(a: number, b: number, c: number): void;
export function wasmmnemonic_asString(a: number, b: number): void;
export function wasmmnemonic_toWords(a: number, b: number): void;
export function __wbg_wasmaddressindex_free(a: number): void;
export function wasmaddressindex_createNew(): number;
export function wasmaddressindex_createLastUnused(): number;
export function wasmaddressindex_createPeek(a: number): number;
export function rustsecp256k1_v0_8_1_context_create(a: number): number;
export function rustsecp256k1_v0_8_1_context_destroy(a: number): void;
export function rustsecp256k1_v0_8_1_default_illegal_callback_fn(a: number, b: number): void;
export function rustsecp256k1_v0_8_1_default_error_callback_fn(a: number, b: number): void;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export const __wbindgen_export_2: WebAssembly.Table;
export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hb19f5d41ded024e1(a: number, b: number, c: number): void;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
export function __wbindgen_exn_store(a: number): void;
export function wasm_bindgen__convert__closures__invoke2_mut__h299fbb8d3b3f1d36(a: number, b: number, c: number, d: number): void;
