import * as crypto from "crypto";

/**
 * Transforms a PEM formatted ED25519 public key and creates a `crypto.KeyObject` suitable to verify signatures
 * @param pem - The public key in the text-based PEM format
 * @returns A KeyObject holding the provided public key
 */
async function import_public_key(pem: String): Promise<crypto.KeyObject> {
	const pemHeader = "-----BEGIN PRIVATE KEY-----";
	const pemFooter = "-----END PRIVATE KEY-----";
	const pemContents: String = pem.substring(
		pemHeader.length,
		pem.length - pemFooter.length - 1
	);

	const der_buffer = Buffer.from(pemContents, "base64");

	let public_key_subtle: crypto.webcrypto.CryptoKey = await crypto.subtle.importKey(
		"spki",
		der_buffer,
		{ name: "Ed25519" },
		false,
		["verify"]
	);

	let public_key: crypto.KeyObject = crypto.KeyObject.from(public_key_subtle);

	return public_key;
}

/**
 * Create the string that was used to generate the webhook's signature.
 * @param id - The UUID identifying the webhook, contained in the `Webhook-Id` header
 * @param timestamp - The timestamp marking the send time of the webhook, contained in the `Webhook-Timestamp` header
 * @param payload - The body of the webhook.
 * @returns A properly formatted signature string
 */
function construct_signed_data(id: String, timestamp: String, payload: String): String {
	return `${id}.${timestamp}.${payload}`;
}

/**
 * Removes the signature identifier ("v1a," for asymmetric keys like ED25519) from the webhook signature
 * @param signature - The webhook signature, contained in the `Webhook-Signature` header
 * @returns The signature stripped of the Standard Webhook identifier
 */
function strip_and_decode_signature(signature: String): Buffer<ArrayBuffer> {
	const signature_prefix = "v1a,";

	const stripped_sig = signature.substring(signature_prefix.length);

	return Buffer.from(stripped_sig, "base64");
}

async function main() {
	const public_key_pem =
		"-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA3wjctSTLJgR7u2or7sx0sW60ad+zZLHYHGUdMQc1QC8=\n-----END PUBLIC KEY-----\n";
	const webhook_id = "01981e54-414d-7223-acd3-b08f82481364";
	const webhook_signature =
		"v1a,uU7CWSRwXw0955x8rUwDnmrn8WJLEVafI1J3X4DDsP+4NOLlz16kD4FeshACNuOcxIfGl/voFXcaRcaPrEqRDg==";
	const webhook_timestamp = "1752855494";
	const webhook_payload = `{"brand_name":"Amazon","brand_registration_id":"01981e54-4117-71b3-8122-076c7eade396","campaign_registration_id":null,"campaign_website":null,"comments":null,"current_status":"Created","event_category":"BRAND","event_time":"2025-07-18T16:18:14.989348439+00:00","event_type":"Created","previous_status":null}`;

	const stripped_signature = strip_and_decode_signature(webhook_signature);
	const signature_data = Buffer.from(construct_signed_data(webhook_id, webhook_timestamp, webhook_payload));

	const public_key = await import_public_key(public_key_pem);

	const validity = crypto.verify(null, signature_data, public_key, stripped_signature);

	console.log(`The signature was ${validity ? 'valid' : 'invalid'}`);
}

main();
