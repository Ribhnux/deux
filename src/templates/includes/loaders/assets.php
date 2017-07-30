<?php
/**
 * {{theme.name}} assets dependencies loader
 *
 * @package {{theme.name}}
 * @since {{theme.version}}
 */

if ( ! function_exists( '{{theme.slugfn}}_font_url' ) ) :
	/**
	 * Register Google Fonts
	 *
	 * @return string
	 */
	function {{theme.slugfn}}_font_url() {
		global ${{theme.slugfn}}_config;

		$fonts_url = '';
		$font_families = array();
		$font_subsets = array();

		foreach ( ${{theme.slugfn}}_config['asset']['fonts'] as $font ) {
			$font_families[] = urlencode( $font['name'] ) . ':' . implode( ',', $font['variants'] );
			$font_subsets = array_merge( $font_subsets, $font['subsets'] );
		}

		$query_args = array(
			'family' => implode( '|', $font_families ),
			'subset' => implode( ',', array_unique( $font_subsets ) ),
		);

		$fonts_url = add_query_arg( $query_args, '//fonts.googleapis.com/css' );

		return esc_url_raw( $fonts_url );
	}
endif;

if ( ! function_exists( '{{theme.slugfn}}_enqueue_dependencies' ) ) :
	/**
	 * Assets dependencies loader to load fonts, styles, and javascripts.
	 *
	 * @return void
	 */
	function {{theme.slugfn}}_load_dependencies() {
		global ${{theme.slugfn}}_config;

		$assets_path = get_template_directory_uri() . '/assets/vendors/';

		// Load Fonts from google.
		wp_enqueue_style( '{{theme.slug}}-fonts', {{theme.slugfn}}_font_url(), array(), null );

		// Load Stylesheet and Javascript.
		foreach ( ${{theme.slugfn}}_config['asset']['libs'] as $name => $libs ) {
			if ( 'wp' === $libs['source'] ) {
				wp_enqueue_script( $name );
			} else {
				foreach ( $libs['files'] as $file ) {
					if ( ! $file['is_active'] ) continue;

					switch ( $file['ext'] ) {
						case 'css':
							wp_enqueue_style( $name, $assets_path . $file['path'], $file['deps'], $libs['version'] );
							break;

						case 'js':
							wp_enqueue_script( $name, $assets_path . $file['path'], $file['deps'], $libs['version'], true );
							break;
					}
				}
			}
		}
	}
endif;

if ( ! function_exists( '{{theme.slugfn}}_enqueue_scripts' ) ) :
	/**
	 * Enqueues All Scripts
	 *
	 * @link https://codex.wordpress.org/Plugin_API/Action_Reference/wp_enqueue_scripts
	 * @return void
	 */
	function {{theme.slugfn}}_enqueue_scripts() {
		global ${{theme.slugfn}}_config;

		$assets_path = get_template_directory_uri() . '/assets/';
		$style_path = $assets_path . 'css/';
		$script_path = $assets_path . 'js/';

		$main_css = 'main.css';
		$main_js = 'main.js';

		if ( true === ${{theme.slugfn}}_config['optimize'] ) {
			$main_css = 'main.min.css';
			$main_js = 'main.min.js';
		}

		// Load all dependencies.
		{{theme.slugfn}}_load_dependencies();

		// Main stylesheets.
		wp_enqueue_style( '{{theme.slug}}', $style_path . $main_css );

		// Main script.
		wp_enqueue_script( '{{theme.slug}}', $script_path . $main_js, array(), null, true );

		// Enable nested comments reply.
		if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
			wp_enqueue_script( 'comment-reply' );
		}
	}
endif;
add_action( 'wp_enqueue_scripts', '{{theme.slugfn}}_enqueue_scripts' );
