<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'WPCACHEHOME', '/home/clients/c35f06316c8889d40da4b51d256c9dc5/sites/artsquare.ch/wp-content/plugins/wp-super-cache/' );
define('WP_CACHE', false);
define('DB_NAME', 'jw0w1o_WP1259053');

/** MySQL database username */
define('DB_USER', 'jw0w1o_WP1259053');

/** MySQL database password */
define('DB_PASSWORD', 'Atrn68s4qF');

/** MySQL hostname */
define('DB_HOST', 'jw0w1o.myd.infomaniak.com');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'o|!SqfZ~ah,rthyfgc6+NraP@-.U%p*^t#p20NSA&*7*GV|QP6k|Xne5JO<}g,~6');
define('SECURE_AUTH_KEY',  'T^Cq:^^I-V498YEW<:sIlmxzlTU|vSJta&z5mD|_:_G`{QT!W6n>/.mLAo-Osh8R');
define('LOGGED_IN_KEY',    '=;lm0vJ(3|xoiW5Uj7=U9WnvBy:W:2o_mJ9{g0*~GGTm,=3FrU#,KM&d&b?6g;S,');
define('NONCE_KEY',        '5.bG(y&q+0>@BhJwoRpX}Z0uRj=~*2S){J08IH8iL;,K{0lz0/2Z2%H-LTnkT`xP');
define('AUTH_SALT',        '<#:_pw?e%2TnHV=%yst>JQ3pd5g0RO`BkM9vr#uzmK&~C/u?!@lF&!_wR%+;du|V');
define('SECURE_AUTH_SALT', 'Xs`;Rz{Qp8voV7YA30xmEO7U9ekIalauO5;0!P,x<<vZ~sZJV=Lb))juDGW:kkzR');
define('LOGGED_IN_SALT',   'yeBLsBUP;|/>^()JYUR|)H>3wHH*55RY<L0RcC1`3/`q-9bdX+T9~u)my:U90*00');
define('NONCE_SALT',       ':(F+}w#J}t{*_-%;4eEZ`~|hJ5C9-Qi0;|:k+Kn7x<Oq2E%Ze!OqKAF,(-mc_A_!');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_1259053_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
//define('WPLANG', 'en_US');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG',          false);
define('WP_DEBUG_LOG',      false);
define('WP_DEBUG_DISPLAY',  false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
