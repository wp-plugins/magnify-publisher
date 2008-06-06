<?php
/*

Plugin Name: Magnify-Publisher
Plugin URI: http://www.magnify.net/wp/
Description: Enables Magnify.net's video discovery and multimedia capabilities.
Version: 0.97
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

$version = '0.97';

global $wp_db_version;
if ( $wp_db_version > 6124 ) {
	$wpversion = 2.5;
} elseif ( class_exists('WP_Scripts') ) {
	$wpversion = 2.1;	
} else {
	$wpversion = 2.0;	
}

$target = 'WP-' . $wpversion . '-' . $version;

// If you hardcode a Magnify.net channel url here, all key config screens will be hidden
$channel = '';

function magnify_publisher_init() {
	global $channel;

	if ( !$channel )
		$channel = get_option('magnify_publisher_channel_name');
		
	add_action('admin_menu', 'magnify_publisher_config_page');
}
add_action('init', 'magnify_publisher_init');

function magnify_publisher_config_page() {
	if ( function_exists('add_submenu_page') )
		add_submenu_page('plugins.php', __('Magnify Publisher Configuration'), __('Magnify Publisher Configuration'), 'manage_options', 'magnify-publisher-channel-config', 'magnify_publisher_conf');
}

function magnify_publisher_fix_url($url) {
	$url = preg_replace('!^(http|https)://!i', '', $url);
	$url = preg_replace('!^/!i', '', $url);
	$url = 'http://'.$url;
	return $url;
}

function magnify_publisher_conf() {
	$channel = get_option('magnify_publisher_channel_name');	
	
	$updated = false;
	
	if ( isset($_POST['submit']) ) {
		check_admin_referer();
		
		if (isset($_POST['magnify_publisher_channel_name'])) {
			$channel = $_POST['magnify_publisher_channel_name'];
			if ($channel != null) $channel = magnify_publisher_fix_url($channel);
		} else {
			$channel = null;
		}		
		
		update_option('magnify_publisher_channel_name', $channel);		
		$updated = true;
	}
?>

<div class="wrap">
<?php
if ($updated) {
	echo "<div id='message' class='updated fade'><p>";
	_e('Configuration updated.');
	echo "</p></div>";
}
?>
<h2><?php _e('Magnify Publisher Configuration'); ?></h2>

<form action="" method="post" id="magnify-publisher-conf">
<p><h3><label for="magnify_publisher_channel_name"><?php _e('Magnify  Channel for this Blog:'); ?></label></h3>
<?php _e('Enter your channel\'s web address:'); ?> <input id="magnify_publisher_channel_name" name="magnify_publisher_channel_name" type="text" size="45" value="<?php echo $channel; ?>" /></p>

<p class="submit" style="text-align: left">
	<input type="submit" name="submit" value="<?php _e('Save &raquo;'); ?>" />
<?php
if ( $channel ) {
?>
<input type="button" onclick="mvp_publisher_show_form();" value="<?php _e('Create New Channel &raquo;'); ?>">
<?php
}
?>
</p>

<div id="magnify_publisher_channel_creation" <?php if ($channel) { echo 'style="display: none;"'; } ?>>
	<h3><label for="magnify_publisher_email"><?php _e('If you don\'t already have a channel, create one now:'); ?></label></h3>
	<p><?php _e('Email Address:'); ?> <input id="magnify_publisher_email" name="magnify_publisher_email" type="text" size="30" value="" /> <?php _e('Choose a Password:'); ?> <input id="magnify_publisher_pass" name="magnify_publisher_pass" type="password" size="10" value="" /></p>
	<div style="color: red" id="magnify_publisher_create_msg"></div>
	<p class="submit" id="magnify_publisher_channel_create_btn" style="text-align: left"><input type="button" onclick="mvp_publisher_create_channel( document.getElementById('magnify_publisher_email').value, document.getElementById('magnify_publisher_pass').value )" value="<?php _e('Create New Channel'); ?>" /></p>
</div>
</form>
</div>

<script type="text/javascript">
function mvp_publisher_show_form() {
	document.getElementById('magnify_publisher_channel_creation').style.display = 'block';
}
function mvp_publisher_create_success(channel_name) {
	document.getElementById('magnify_publisher_channel_name').value = channel_name;
	document.getElementById('magnify_publisher_create_msg').innerHTML = 'Channel created; click the "Save Changes" button to preserve this address.'; 
	document.getElementById('magnify_publisher_email').value = '';
	document.getElementById('magnify_publisher_pass').value = '';
	document.getElementById('magnify_publisher_channel_create_btn').style.display = 'none';
	document.getElementById('magnify_publisher_channel_creation').style.display = 'none';
}
function mvp_publisher_create_error(err_text) {
	document.getElementById('magnify_publisher_create_msg').innerHTML = err_text;
}
function mvp_publisher_create_channel(email, pass) {
	var head = document.getElementsByTagName("head")[0];
	var script_el = document.createElement('script');
	script_el.type = 'text/javascript';
	script_el.src = 'http://www.magnify.net/wp/create?email=' + escape(email) + '&pass=' + escape(pass);
	head.appendChild(script_el);
}
</script>
<?php
}

if ( !get_option('magnify_publisher_channel_name') && !$channel && !isset($_POST['submit']) ) {
	function magnify_publisher_warning() {
		echo "
		<div id='magnify-publisher-warning' class='updated fade'><p>".sprintf(__('You must <a href="%1$s">create a Magnify channel or enter your Magnify channel url</a> for the Magnify Publisher plugin to work.'), "plugins.php?page=magnify-publisher-channel-config")."</p></div>
		";
	}
	add_action('admin_notices', 'magnify_publisher_warning');
	return;
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
	echo 'magnify_publisher_url : "' . $channel . '",';
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
	$init_array['magnify_publisher_url'] = $channel;
	$init_array['extended_valid_elements'] = 'img[*],' . $init_array['extended_valid_elements'];
	return $init_array;	
}
?>
