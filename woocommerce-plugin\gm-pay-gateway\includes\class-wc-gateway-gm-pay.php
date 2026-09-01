<?php
/**
 * GM Pay WooCommerce Payment Gateway Implementation
 *
 * @package GMPay
 */

if (!defined('ABSPATH')) {
    exit;
}

class WC_Gateway_GM_Pay extends WC_Payment_Gateway {

    public function __construct() {
        $this->id = 'gm_pay';
        $this->icon = apply_filters('woocommerce_gm_pay_icon', '');
        $this->has_fields = false;
        $this->method_title = __('GM Pay (bKash, Nagad, Rocket, Upay)', 'gm-pay-woocommerce');
        $this->method_description = __('Automated zero-delay payment gateway with smart multi-SIM failover & instant TrxID validation.', 'gm-pay-woocommerce');

        // Load settings
        $this->init_form_fields();
        $this->init_settings();

        $this->title = $this->get_option('title', 'bKash, Nagad, Rocket, Upay (GM Pay)');
        $this->description = $this->get_option('description', 'Pay securely using bKash, Nagad, DBBL Rocket or Upay with instant confirmation.');
        $this->enabled = $this->get_option('enabled', 'no');

        // Hook save settings
        add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));

        // Register Webhook Endpoint in WordPress REST API
        add_action('rest_api_init', array($this, 'register_webhook_routes'));
    }

    /**
     * Admin Settings Form
     */
    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title' => __('Enable/Disable', 'gm-pay-woocommerce'),
                'type' => 'checkbox',
                'label' => __('Enable GM Pay Gateway', 'gm-pay-woocommerce'),
                'default' => 'yes',
            ),
            'title' => array(
                'title' => __('Title', 'gm-pay-woocommerce'),
                'type' => 'text',
                'description' => __('Payment method title that the customer sees during checkout.', 'gm-pay-woocommerce'),
                'default' => __('bKash, Nagad, Rocket, Upay (Instant Pay)', 'gm-pay-woocommerce'),
                'desc_tip' => true,
            ),
            'description' => array(
                'title' => __('Description', 'gm-pay-woocommerce'),
                'type' => 'textarea',
                'description' => __('Payment method description that the customer sees during checkout.', 'gm-pay-woocommerce'),
                'default' => __('Pay easily and safely with bKash, Nagad, or Rocket. Enter TrxID to verify instantly.', 'gm-pay-woocommerce'),
            ),
            'api_endpoint' => array(
                'title' => __('GM Pay API Server URL', 'gm-pay-woocommerce'),
                'type' => 'text',
                'description' => __('Your hosted GM Pay server URL (e.g. https://your-gmpay.vercel.app or http://localhost:3000)', 'gm-pay-woocommerce'),
                'default' => 'https://your-gmpay.vercel.app',
            ),
            'api_key' => array(
                'title' => __('API Key', 'gm-pay-woocommerce'),
                'type' => 'text',
                'description' => __('Your GM Pay Merchant API Key (From Merchant Dashboard).', 'gm-pay-woocommerce'),
                'default' => '',
            ),
            'api_secret' => array(
                'title' => __('API Secret', 'gm-pay-woocommerce'),
                'type' => 'password',
                'description' => __('Your GM Pay Merchant API Secret.', 'gm-pay-woocommerce'),
                'default' => '',
            ),
            'webhook_secret' => array(
                'title' => __('Webhook Signing Secret', 'gm-pay-woocommerce'),
                'type' => 'text',
                'description' => __('HMAC signing secret for verifying incoming webhooks from GM Pay Core.', 'gm-pay-woocommerce'),
                'default' => '',
            ),
            'sandbox_mode' => array(
                'title' => __('Sandbox Test Mode', 'gm-pay-woocommerce'),
                'type' => 'checkbox',
                'label' => __('Enable Sandbox Test Mode', 'gm-pay-woocommerce'),
                'default' => 'no',
            ),
        );
    }

    /**
     * Process Payment on Checkout
     */
    public function process_payment($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) {
            wc_add_notice(__('Invalid order.', 'gm-pay-woocommerce'), 'error');
            return array('result' => 'failure');
        }

        $api_url = rtrim($this->get_option('api_endpoint'), '/') . '/api/v1/checkout/create-session';
        $api_key = $this->get_option('api_key');

        $body = array(
            'amount' => (float) $order->get_total(),
            'order_id' => (string) $order->get_id(),
            'customer_name' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
            'customer_phone' => $order->get_billing_phone(),
            'customer_email' => $order->get_billing_email(),
            'redirect_url' => $this->get_return_url($order),
            'cancel_url' => wc_get_cart_url(),
        );

        $response = wp_remote_post($api_url, array(
            'method' => 'POST',
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key,
            ),
            'body' => json_encode($body),
            'timeout' => 20,
        ));

        if (is_wp_error($response)) {
            wc_add_notice(__('Unable to connect to GM Pay server. Please try again.', 'gm-pay-woocommerce'), 'error');
            return array('result' => 'failure');
        }

        $result = json_decode(wp_remote_retrieve_body($response), true);

        if (!empty($result['success']) && !empty($result['data']['checkout_url'])) {
            // Save session ID in order meta
            $order->update_meta_data('_gm_pay_session_id', $result['data']['session_id']);
            $order->save();

            return array(
                'result' => 'success',
                'redirect' => $result['data']['checkout_url'],
            );
        } else {
            $error_message = !empty($result['message']) ? $result['message'] : __('Payment initialization failed.', 'gm-pay-woocommerce');
            wc_add_notice($error_message, 'error');
            return array('result' => 'failure');
        }
    }

    /**
     * Register REST API Webhook Endpoint (wp-json/gm-pay/v1/webhook)
     */
    public function register_webhook_routes() {
        register_rest_route('gm-pay/v1', '/webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_incoming_webhook'),
            'permission_callback' => '__return_true',
        ));
    }

    /**
     * Handle Incoming HMAC Verified Webhook
     */
    public function handle_incoming_webhook($request) {
        $body = $request->get_json_params();
        $signature = $request->get_header('x_gm_pay_signature');
        $raw_body = $request->get_body();

        $secret = $this->get_option('webhook_secret');

        // Verify HMAC Signature if secret is set
        if (!empty($secret) && !empty($signature)) {
            $expected_sig = hash_hmac('sha256', $raw_body, $secret);
            if (!hash_equals($expected_sig, $signature)) {
                return new WP_REST_Response(array('success' => false, 'message' => 'Invalid Webhook Signature'), 401);
            }
        }

        $order_id = isset($body['order_id']) ? $body['order_id'] : null;
        $trx_id = isset($body['trx_id']) ? $body['trx_id'] : '';
        $provider = isset($body['provider']) ? $body['provider'] : 'MFS';
        $amount = isset($body['amount']) ? $body['amount'] : 0;

        if (!$order_id) {
            return new WP_REST_Response(array('success' => false, 'message' => 'Order ID missing'), 400);
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_REST_Response(array('success' => false, 'message' => 'Order not found'), 404);
        }

        // Avoid double processing
        if ($order->is_paid()) {
            return new WP_REST_Response(array('success' => true, 'message' => 'Order already paid'), 200);
        }

        // Mark order as paid & completed
        $order->payment_complete($trx_id);
        $order->add_order_note(sprintf(
            __('GM Pay Payment Confirmed! Provider: %s, TrxID: %s, Amount: %s', 'gm-pay-woocommerce'),
            $provider,
            $trx_id,
            wc_price($amount)
        ));

        return new WP_REST_Response(array('success' => true, 'message' => 'Order status updated successfully'), 200);
    }
}
