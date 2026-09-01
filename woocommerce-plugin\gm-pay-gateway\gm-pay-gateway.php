<?php
/**
 * Plugin Name: GM Pay for WooCommerce
 * Plugin URI: https://growthmark.io/gm-pay
 * Description: Automated, zero-delay payment gateway for bKash, Nagad, Rocket and Upay with smart multi-SIM failover.
 * Version: 1.0.0
 * Author: GrowthMark Technologies
 * Author URI: https://growthmark.io
 * Text Domain: gm-pay-woocommerce
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 9.0
 *
 * @package GMPay
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Declare HPOS compatibility
add_action('before_woocommerce_init', function () {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
    }
});

// Register GM Pay Gateway into WooCommerce
add_filter('woocommerce_payment_gateways', 'gm_pay_add_gateway_class');
function gm_pay_add_gateway_class($gateways) {
    $gateways[] = 'WC_Gateway_GM_Pay';
    return $gateways;
}

// Initialize the Gateway Class after plugins are loaded
add_action('plugins_loaded', 'gm_pay_init_gateway_class');
function gm_pay_init_gateway_class() {
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    require_once plugin_dir_path(__FILE__) . 'includes/class-wc-gateway-gm-pay.php';
}

// Enqueue styles and scripts
add_action('wp_enqueue_scripts', 'gm_pay_enqueue_checkout_assets');
function gm_pay_enqueue_checkout_assets() {
    if (is_checkout()) {
        wp_enqueue_style('gm-pay-checkout-style', plugin_dir_url(__FILE__) . 'assets/css/gm-pay-style.css', array(), '1.0.0');
        wp_enqueue_script('gm-pay-checkout-js', plugin_dir_url(__FILE__) . 'assets/js/gm-pay-checkout.js', array('jquery'), '1.0.0', true);

        wp_localize_script('gm-pay-checkout-js', 'gm_pay_params', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'rest_url' => get_rest_url(null, 'gm-pay/v1/'),
        ));
    }
}
