<?php
/*

Plugin Name: Magnify-Publisher
Plugin URI: http://www.magnify.net/wp/
Description: Enables Magnify.net's video discovery and multimedia capabilities.
Version: 0.96
Author: Magnify.net 
Author URI: http://www.magnify.net/

Copyright 2008 Magnify Networks (www.magnify.net)

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

*/

$version = '0.96';
global $wp_db_version;
if ( $wp_db_version > 6124 ) {
	$wpversion = 2.5;
} elseif ( class_exists('WP_Scripts') ) {
	$wpversion = 2.1;	
} else {
	$wpversion = 2.0;	
}

add_option( 'magnify_publisher_channel_name', 'publisher.magnify.net' );
# update_option( 'magnify_publisher_channel_name', $input );

$target = 'WP-' . $wpversion . '-' . $version;
$channel = get_option('magnify_publisher_channel_name');
if ( ! $channel ) {
  $channel = 'publisher.magnify.net';
}

// init process for button control
add_action('init', 'magnify_publisher_addbuttons');

function magnify_publisher_addbuttons() {
	global $wpversion;
	// Don't bother doing this stuff if the current user lacks permissions
	if ( ! current_user_can('edit_posts') && ! current_user_can('edit_pages') )
		return;

	// Add only in Rich Editor mode
	if ( get_user_option('rich_editing') != 'true')
		return;
	

	add_filter('mce_buttons', 'magnify_publisher_register_button');
	
	// WordPress 2.5+ (TinyMCE 3.x)
	if ( $wpversion >= 2.5 ) {	
		add_filter("mce_external_plugins", "magnify_publisher_add_tinymce_ext_plugin");
		add_filter( 'tiny_mce_before_init', 'magnify_tinymce3_before_init' );
	} else {
		add_filter("mce_plugins", "magnify_publisher_add_tinymce_plugin");		
		add_filter('mce_valid_elements', 'magnify_publisher_add_valid_elements');
		add_action('mce_options', 'magnify_publisher_add_params');
		add_action('tinymce_before_init', "magnify_tinymce2_before_init");
	}
}

function magnify_publisher_register_button($buttons) {
	array_push($buttons, "separator", "magnify_publisher");
	return $buttons;
}

function magnify_publisher_add_tinymce_ext_plugin($plugin_array) {	
	$plugin_array['magnify_publisher'] = get_bloginfo('wpurl') . 
		 	'/wp-content/plugins/Magnify-Publisher' . "/tinymce_3/editor_plugin.js";
	return $plugin_array;
}

function magnify_publisher_add_tinymce_plugin($plugins) {
	// WordPress 2.1
	array_push($plugins, 'magnify_publisher');
	return $plugins;
}

function magnify_publisher_add_params() {
	global $target;
	global $channel;
	echo 'magnify_publisher_target : "' . $target . '",';
	echo 'magnify_publisher_url : ' . '"http://' . $channel . '",';
}

function magnify_publisher_add_valid_elements($valid_elements) {
	$valid_elements .= ',img[*]';
	return $valid_elements;
}

if ( $wpversion >= 2.5 ) {	
	add_filter('tiny_mce_version', 'magnify_publisher_mce_version');
}

function magnify_publisher_mce_version($ver) {
	global $version;
	return $ver + $version;
}

function magnify_tinymce2_before_init() {
	// WordPress 2.1
	echo 'tinyMCE.loadPlugin("magnify_publisher", "' . get_bloginfo('wpurl') . 
			'/wp-content/plugins/Magnify-Publisher' . '/tinymce_2/");';		
}

function magnify_tinymce3_before_init($init_array) {
	global $target;
	global $channel;
	global $wpversion;
	$init_array['magnify_publisher_target'] = $target;
	$init_array['magnify_publisher_url'] = 'http://' . $channel;
	$init_array['extended_valid_elements'] = 'img[*],' . $init_array['extended_valid_elements'];
	return $init_array;	
}
?>
